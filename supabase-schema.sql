-- Create survey_responses table
CREATE TABLE IF NOT EXISTS survey_responses (
  id BIGSERIAL PRIMARY KEY,
  age VARCHAR(10) NOT NULL,
  gender VARCHAR(10) NOT NULL,
  location VARCHAR(10) NOT NULL,
  income VARCHAR(20) NOT NULL,
  original_response TEXT NOT NULL,
  translated_response TEXT,
  sentiment VARCHAR(10) NOT NULL,
  language VARCHAR(5) NOT NULL DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_survey_responses_created_at ON survey_responses(created_at);
CREATE INDEX IF NOT EXISTS idx_survey_responses_sentiment ON survey_responses(sentiment);
CREATE INDEX IF NOT EXISTS idx_survey_responses_location ON survey_responses(location);
CREATE INDEX IF NOT EXISTS idx_survey_responses_age ON survey_responses(age);

-- Enable Row Level Security (RLS)
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert survey responses
CREATE POLICY "Allow public insert on survey_responses" ON survey_responses
  FOR INSERT WITH CHECK (true);

-- Create policy to allow anyone to read survey responses
CREATE POLICY "Allow public read on survey_responses" ON survey_responses
  FOR SELECT USING (true);

-- Grant necessary permissions
GRANT ALL ON survey_responses TO anon;
GRANT ALL ON survey_responses TO authenticated;
GRANT USAGE ON SEQUENCE survey_responses_id_seq TO anon;
GRANT USAGE ON SEQUENCE survey_responses_id_seq TO authenticated;
