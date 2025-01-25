import numpy as np
import cv2
from ultralytics import YOLO
from collections import defaultdict
from PIL import Image


class YOLODetector:
    def __init__(self, model_path='model.pt'):
        self.model = YOLO(model_path)

    def _convert_patch_coords_to_original(self, box, patch_i, patch_j, step, original_size):
        orig_x = box[0] + patch_j * step
        orig_y = box[1] + patch_i * step
        orig_x2 = box[2] + patch_j * step
        orig_y2 = box[3] + patch_i * step

        orig_x = min(max(0, orig_x), original_size[1])
        orig_y = min(max(0, orig_y), original_size[0])
        orig_x2 = min(max(0, orig_x2), original_size[1])
        orig_y2 = min(max(0, orig_y2), original_size[0])

        return [orig_x, orig_y, orig_x2, orig_y2]

    def _box_iou(self, box1, box2):
        x1 = max(box1[0], box2[0])
        y1 = max(box1[1], box2[1])
        x2 = min(box1[2], box2[2])
        y2 = min(box1[3], box2[3])

        intersection = max(0, x2 - x1) * max(0, y2 - y1)
        area1 = (box1[2] - box1[0]) * (box1[3] - box1[1])
        area2 = (box2[2] - box2[0]) * (box2[3] - box2[1])

        return intersection / (area1 + area2 - intersection)

    def detect_varroas(self, image, progress_callback=None, img_size=640, overlap=100, iou_threshold=0.2):
        if isinstance(image, Image.Image):
            image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)

        original_height, original_width = image.shape[:2]
        step = img_size - overlap

        nb_cols = max(1, (original_width + step - 1) // step)
        nb_rows = max(1, (original_height + step - 1) // step)

        all_detections = defaultdict(list)

        total_patches = nb_rows * nb_cols
        current_patch = 0

        for i in range(nb_rows):
            for j in range(nb_cols):
                if progress_callback:
                    progress = (current_patch / total_patches) * 100
                    progress_callback(progress)
                current_patch += 1
                start_y = i * step
                start_x = j * step

                patch = np.full((img_size, img_size, 3), (0, 0, 255), dtype=image.dtype)

                end_y = min(start_y + img_size, original_height)
                end_x = min(start_x + img_size, original_width)

                actual_height = end_y - start_y
                actual_width = end_x - start_x

                if start_y < original_height and start_x < original_width:
                    patch[:actual_height, :actual_width] = image[start_y:end_y, start_x:end_x]

                results = self.model(patch)

                for r in results:
                    boxes = r.boxes
                    for box in boxes:
                        x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                        cls = int(box.cls[0])
                        conf = float(box.conf[0])

                        # Vérifier si la détection est sur un bord sans image adjacente
                        # Vérifier si la détection est sur un bord
                        is_on_border = (x1 < 5 or  # Bord gauche
                                        y1 < 5 or  # Bord haut
                                        x2 > img_size - 5 or  # Bord droit
                                        y2 > img_size - 5)  # Bord bas

                        if is_on_border:
                            continue  # Ignorer cette détection

                        if is_on_border:
                            continue  # Ignorer cette détection

                        orig_coords = self._convert_patch_coords_to_original(
                            [x1, y1, x2, y2], i, j, step, (original_height, original_width)
                        )

                        all_detections[cls].append(orig_coords + [conf])

        # Filter duplicate detections
        final_detections = []
        total_count = 0

        for cls in all_detections:
            detections = all_detections[cls]
            detections.sort(key=lambda x: x[4], reverse=True)

            kept_detections = []
            for det in detections:
                duplicate = False
                for kept_det in kept_detections:
                    if self._box_iou(det[:4], kept_det[:4]) > iou_threshold:
                        duplicate = True
                        break

                if not duplicate:
                    kept_detections.append(det)
                    total_count += 1

        ''' *** dessiner les lignes de coupure ***

        # Draw cut lines
        overlay = image.copy()
        # Lignes verticales
        for j in range(0, nb_cols):
            cv2.line(overlay, (img_size + j * step, 0), (img_size + j * step, original_height), (255, 0, 0), 2)
            cv2.line(overlay, (j * (step + 1), 0), (j * (step + 1), original_height), (255, 255, 0), 2)
        # Lignes horizontales
        for i in range(0, nb_rows):
            cv2.line(overlay, (0, img_size + i * step), (original_width, img_size + i * step), (255, 0, 0), 2)
            cv2.line(overlay, (0, i * (step + 1)), (original_width, i * (step + 1)), (255, 255, 0), 2)

        # Appliquer l'overlay avec transparence
        cv2.addWeighted(overlay, 0.5, image, 0.5, 0, image)
        '''
        # Draw detections on image
        for cls in all_detections:
            for det in kept_detections:
                x1, y1, x2, y2 = map(int, det[:4])
                cv2.rectangle(image, (x1, y1), (x2, y2), (0, 255, 0), 2)

        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        result_image = Image.fromarray(image_rgb)

        return total_count, result_image