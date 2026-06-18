CREATE TABLE setting_value_type (
    type TEXT PRIMARY KEY UNIQUE NOT NULL
);

CREATE TABLE setting (
    name TEXT NOT NULL,
    value_type TEXT NOT NULL,
    default_value TEXT NOT NULL,
    user_value TEXT NULL DEFAULT NULL,

    PRIMARY KEY (name),
    FOREIGN KEY (value_type) REFERENCES setting_value_type (type),
    UNIQUE (name)
);

INSERT INTO setting_value_type (type) VALUES ('text'), ('boolean'), ('location_folder');
INSERT INTO setting (name, value_type, default_value) VALUES
('default_audio_format', 'text', 'mp3'),
('default_video_format', 'text', 'mp4'),
('audio_only', 'boolean', 'false'),
('output_template', 'text', '%(title)s.%(ext)s'),

('text_color', 'text', 'white'),
('outline_color', 'text', 'red'),
('background', 'text', 'black'),
('app_title', 'text', 'c00ltubee')
;