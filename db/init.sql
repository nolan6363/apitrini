use apitrini_db;

create table apiary
(
    id          int auto_increment
        primary key,
    name        varchar(255)                          not null,
    location    varchar(255)                          null,
    created_at  timestamp default current_timestamp() not null,
    description varchar(255)                          null
);

create table hive
(
    id           int auto_increment
        primary key,
    name         varchar(255)                          not null,
    apiary_id_fk int                                   not null,
    created_at   timestamp default current_timestamp() not null,
    description  varchar(255)                          null,
    constraint hive_ibfk_1
        foreign key (apiary_id_fk) references apiary (id)
            on delete cascade
);

create table analysis
(
    id           int auto_increment
        primary key,
    created_at   timestamp default current_timestamp() not null,
    picture_path varchar(255)                          not null,
    varroa_count int                                   null,
    hive_id_fk   int                                   not null,
    notes        text                                  null,
    constraint analysis_ibfk_1
        foreign key (hive_id_fk) references hive (id)
            on delete cascade
);

create index idx_analyse_ruche
    on analysis (hive_id_fk);

create index idx_ruche_rucher
    on hive (apiary_id_fk);

create table user
(
    id             int auto_increment
        primary key,
    email          varchar(255)                          not null,
    password_hash  varchar(255)                          not null,
    first_name     varchar(255)                          not null,
    last_name      varchar(255)                          not null,
    created_at     timestamp default current_timestamp() not null,
    analysis_count int                                   null,
    constraint unique_email
        unique (email)
);

create table relations_user_apiary
(
    id           int auto_increment
        primary key,
    apiary_id_fk int                         not null,
    role         varchar(50) default 'owner' null,
    user_id_fk   int                         not null,
    constraint relations_user_apiary_ibfk_2
        foreign key (apiary_id_fk) references apiary (id)
            on delete cascade,
    constraint relations_user_apiary_ibfk_3
        foreign key (user_id_fk) references user (id)
            on delete cascade
);

create index rucher_id_fk
    on relations_user_apiary (apiary_id_fk);

create index user_id_fk
    on relations_user_apiary (user_id_fk);

create index idx_user_email
    on user (email);

