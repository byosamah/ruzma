-- Create AI usage tracking table
CREATE TABLE IF NOT EXISTS ai_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_type TEXT NOT NULL CHECK (feature_type IN ('business_insights', 'project_recommendations', 'revenue_optimization', 'project_types')),
  usage_date DATE NOT NULL,
  usage_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_date ON ai_usage(user_id, usage_date);
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_feature ON ai_usage(user_id, feature_type);
CREATE UNIQUE INDEX IF NOT EXISTS idx_ai_usage_user_feature_date ON ai_usage(user_id, feature_type, usage_date);

-- Enable RLS (Row Level Security)
ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own AI usage" ON ai_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI usage" ON ai_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI usage" ON ai_usage
  FOR UPDATE USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON ai_usage TO authenticated;
GRANT USAGE ON SEQUENCE ai_usage_id_seq TO authenticated;