create table users_pathfindr (
   id            number primary key,
   name          varchar(30),
   email         varchar(80) unique not null,
   password_hash varchar(60),
   created_at    timestamp default systimestamp
);

create table subscriptions_pathfindr (
   id         number primary key,
   user_id    number not null,
   active     number(1) default 0,
   started_at timestamp default systimestamp,
   expires_at timestamp null,
   created_at timestamp default systimestamp,
   constraint fk_sub_user foreign key ( user_id )
      references users_pathfindr ( id )
);
