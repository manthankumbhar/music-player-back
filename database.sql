create table auth_user_info(
    id uuid DEFAULT uuid_generate_v4() not null,
    email VARCHAR NOT NULL UNIQUE,
    password VARCHAR NOT NULL,
    created_at timestamptz DEFAULT Now() not null,
    updated_at timestamptz DEFAULT Now() not null
);