-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*

*/

CREATE SCHEMA _private;

CREATE TABLE _private.profile (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    display_name VARCHAR(255),
    bio VARCHAR(255),
    birthdate DATE,
    faculty VARCHAR(255),
    department VARCHAR(255),
    year VARCHAR(255) CHECK (year IN ('1', '2', '3', '4', '>4')),
    line VARCHAR(255),
    facebook VARCHAR(255),
    instagram VARCHAR(255),
    other VARCHAR(255),
    embedding vector(768),
    created_time TIMESTAMP NOT NULL DEFAULT now(),
    updated_time TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE _private.interest (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL
);

CREATE TABLE _private.user_interest (
    interest_id UUID NOT NULL REFERENCES _private.interest(id),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    PRIMARY KEY (interest_id, user_id)
);

CREATE TABLE _private.interaction (
    from_user_id UUID NOT NULL REFERENCES auth.users(id),
    to_user_id UUID NOT NULL REFERENCES auth.users(id),
    liked BOOLEAN NOT NULL,
    created_time TIMESTAMP NOT NULL DEFAULT now(),
    updated_time TIMESTAMP NOT NULL DEFAULT now(),
    PRIMARY KEY (from_user_id, to_user_id)
);

CREATE TYPE _private.visibility AS ENUM ('private', 'connected', 'public');

CREATE TABLE _private.settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id),
    profile_visibility _private.visibility NOT NULL DEFAULT 'public',
    contact_info_visibility _private.visibility NOT NULL DEFAULT 'connected',
    noti_new_message BOOLEAN NOT NULL DEFAULT TRUE,
    noti_new_connection_request BOOLEAN NOT NULL DEFAULT TRUE,
    noti_new_connection_request_accept BOOLEAN NOT NULL DEFAULT TRUE,
    created_time TIMESTAMP NOT NULL DEFAULT now(),
    updated_time TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE _private.notification (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    data JSONB NOT NULL,
    type VARCHAR(255) NOT NULL,
    read_at TIMESTAMP,
    created_time TIMESTAMP NOT NULL DEFAULT now(),
    updated_time TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE _private.room (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_1 UUID NOT NULL REFERENCES auth.users(id),
    user_2 UUID NOT NULL REFERENCES auth.users(id)
);

CREATE TABLE _private.chat (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES _private.room(id),
    author_id UUID NOT NULL REFERENCES auth.users(id),
    message VARCHAR(255) NOT NULL,
    read_at TIMESTAMP,
    created_time TIMESTAMP NOT NULL DEFAULT now(),
    updated_time TIMESTAMP NOT NULL DEFAULT now()
);


INSERT INTO _private.interest (name) VALUES
('📚 Study Groups'),
('⚽ Sports'),
('🎮 Gaming'),
('🎶 Music'),
('📸 Photography'),
('✈️ Travel'),
('🌱 Environmental Causes'),
('🤝 Networking'),
('💻 Coding'),
('🧑‍🏫 Tutoring'),
('🛠️ Skill Sharing'),
('🎨 Art'),
('🎭 Theatre'),
('🧘 Yoga'),
('📖 Reading'),
('🏆 Competitions'),
('🏕️ Camps'),
('💬 Language Exchange'),
('🎓 Internships'),
('🌟 Personal Growth'),
('🍳 Cooking'),
('🧩 Puzzles'),
('🕹️ Esports'),
('🏋️‍♀️ Fitness'),
('🌌 Astronomy'),
('💡 Innovation'),
('🐾 Pet Care'),
('🌍 Volunteering'),
('🛤️ Adventure'),
('🏖️ Beach Activities'),
('🧵 Crafting'),
('🍿 Movies'),
('🗺️ Geography'),
('🧑‍🍳 Baking'),
('💬 Public Speaking'),
('🚴 Cycling'),
('🚶 Hiking'),
('🥋 Martial Arts'),
('🤖 Robotics'),
('✍️ Writing'),
('🧑‍🎨 Graphic Design'),
('💃 Dance'),
('🌾 Gardening'),
('🍹 Mixology'),
('🎤 Singing'),
('🎥 Filmmaking'),
('🎧 Podcasting'),
('🧑‍🔬 Research Opportunities'),
('💼 Part-time Jobs'),
('🧘‍♂️ Meditation'),
('🧠 Mental Wellness');
