# Medicine Price Survey

A multilingual survey application for collecting public opinion on medicine price increases in Pakistan.

## Features

- **Multilingual Support**: English and Urdu
- **Real-time Analytics**: Charts and sentiment analysis
- **Data Export**: CSV download functionality
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Backend Integration**: Supabase PostgreSQL database

## Tech Stack

- **Frontend**: React + Tailwind CSS
- **Backend**: Vercel Serverless Functions
- **Database**: Supabase PostgreSQL
- **Translation**: Google Translate API
- **Sentiment Analysis**: OpenAI GPT-3.5-turbo

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Update your `.env` file with the actual values:

```env
VITE_SUPABASE_URL=your_actual_supabase_url
VITE_SUPABASE_ANON_KEY=your_actual_supabase_anon_key
```

### 3. Set Up Database

Run the SQL script in your Supabase SQL editor:

```sql
-- Copy and paste the contents of supabase-schema.sql
```

### 4. Start Development Server

```bash
npm run dev
```

The app will open at `http://localhost:3000`

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key |

## Database Schema

The `survey_responses` table includes:
- `id`: Primary key
- `age`: Age group (20-35, 35-50, 50+)
- `gender`: Gender (male, female)
- `location`: Location (urban, rural)
- `income`: Income range (<20k, 20-50k, 50-100k, >100k)
- `original_response`: User's original response
- `translated_response`: Translated version
- `sentiment`: Sentiment analysis result (positive, negative, neutral)
- `language`: Response language (en, ur)
- `created_at`: Timestamp

## Fallback Mode

If Supabase is not configured, the app automatically falls back to localStorage for data storage, ensuring it works out of the box.

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

Make sure to add these in your Vercel project settings:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## API Integrations

### Google Translate API
- Replace the simulated translation function with actual Google Translate API calls
- Add your Google Cloud API key to environment variables

### OpenAI API
- Replace the simulated sentiment analysis with OpenAI GPT-3.5-turbo
- Add your OpenAI API key to environment variables

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License
