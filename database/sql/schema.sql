CREATE TABLE task_status_type (
    type TEXT PRIMARY KEY UNIQUE NOT NULL
);

CREATE TABLE download_history (
    task_id TEXT NOT NULL,
    title TEXT NOT NULL,
    status_type TEXT NOT NULL,
    log_file_path TEXT NULL DEFAULT NULL,

    PRIMARY KEY (task_id),
    FOREIGN KEY (status_type) REFERENCES task_status_type (type),
    UNIQUE (task_id)
);