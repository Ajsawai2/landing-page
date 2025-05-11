const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://fmfeivzeszqyoxljvbir.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtZmVpdnplc3pxeW94bGp2YmlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MDI5MTEsImV4cCI6MjA2MjA3ODkxMX0.Gf7Xn-xZxNSNn6yRFTH3HwAxINClDn54V9GfF2WkmY8';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      Accept: 'application/json',
    },
  },
});

const retryOperation = async (operation, retries = 3, initialDelay = 1000) => {
  let delay = initialDelay;
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (err) {
      if (i === retries - 1) {
        throw new Error(`Operation failed after ${retries} retries: ${err.message}`);
      }
      console.warn(`Retry ${i + 1}/${retries} failed: ${err.message}. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
};

const checkSupabaseConnection = async () => {
  try {
    console.log('Checking Supabase connectivity...');
    // Use retryOperation to handle intermittent failures
    return await retryOperation(async () => {
      // Perform a simple REST API ping to verify connectivity
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Supabase server responded with status ${response.status}: ${response.statusText}`);
      }

      console.log('Supabase connection verified successfully');
      return true;
    });
  } catch (err) {
    console.error('Supabase connection check failed:', err.message, 'Stack:', err.stack);
    console.error('Possible causes:');
    console.error('- Invalid Supabase URL or Key. Check REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY.');
    console.error('- Network connectivity issues. Ensure you are connected to the internet.');
    console.error('- Supabase server may be down. Check the Supabase status page.');
    return false;
  }
};

const setupDatabase = async () => {
  const setupStatus = {
    profilesTable: false,
    tasksTable: false,
    schemaValid: false,
    errors: [],
  };

  try {
    // Check if profiles table exists and has required columns
    const { data: profilesData, error: profilesError } = await retryOperation(() =>
      supabase.from('profiles').select('id, username, location, email, phone').limit(1)
    );

    if (profilesError) {
      if (profilesError.code === '42P01') {
        setupStatus.errors.push('Profiles table does not exist.');
        console.error('Profiles table does not exist. Please create it manually in the Supabase dashboard with the following schema:');
        console.error(`
          CREATE TABLE public.profiles (
            id UUID PRIMARY KEY,
            username TEXT NOT NULL UNIQUE,
            location TEXT,
            email TEXT NOT NULL UNIQUE,
            phone TEXT UNIQUE,
            created_at TIMESTAMP DEFAULT NOW()
          );

          CREATE INDEX idx_profiles_email ON public.profiles(email);
          CREATE INDEX idx_profiles_phone ON public.profiles(phone);

          ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

          CREATE POLICY "Allow anon read access to profiles" ON public.profiles
          FOR SELECT USING (true);

          CREATE POLICY "Allow insert for authenticated users" ON public.profiles
          FOR INSERT WITH CHECK (auth.uid() = id);

          CREATE POLICY "Users can update own profile" ON public.profiles
          FOR UPDATE USING (auth.uid() = id);
        `);
      } else if (profilesError.message.includes('column')) {
        setupStatus.errors.push(`Profiles table is missing required columns: ${profilesError.message}`);
        console.error('Profiles table is missing required columns. Ensure it has id, username, location, email, phone, and created_at.');
      } else {
        setupStatus.errors.push(`Error checking profiles table: ${profilesError.message}`);
        console.error('Error checking profiles table:', profilesError.message);
      }
    } else {
      console.log('Profiles table exists and has the required schema.');
      setupStatus.profilesTable = true;
    }

    // Check if tasks table exists and has required columns
    const { data: tasksData, error: tasksError } = await retryOperation(() =>
      supabase.from('tasks').select('id, title, description, location, price, category, status, user_id, accepted_by, created_at, attachment').limit(1)
    );

    if (tasksError) {
      if (tasksError.code === '42P01') {
        setupStatus.errors.push('Tasks table does not exist.');
        console.error('Tasks table does not exist. Please create it manually in the Supabase dashboard with the following schema:');
        console.error(`
          CREATE TABLE public.tasks (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title TEXT NOT NULL,
            description TEXT,
            location TEXT,
            price TEXT NOT NULL,
            category TEXT,
            status TEXT DEFAULT 'open',
            user_id UUID REFERENCES auth.users(id),
            accepted_by UUID REFERENCES auth.users(id),
            created_at TIMESTAMP DEFAULT NOW(),
            attachment TEXT
          );

          CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
          CREATE INDEX idx_tasks_status ON public.tasks(status);

          ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

          CREATE POLICY "Allow anon read access to tasks" ON public.tasks
          FOR SELECT USING (true);

          CREATE POLICY "Allow insert for authenticated users" ON public.tasks
          FOR INSERT WITH CHECK (auth.uid() = user_id);

          CREATE POLICY "Allow update for authenticated users" ON public.tasks
          FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = accepted_by);
        `);
      } else if (tasksError.message.includes('column')) {
        setupStatus.errors.push(`Tasks table is missing required columns: ${tasksError.message}`);
        console.error('Tasks table is missing required columns. Ensure it has id, title, description, location, price, category, status, user_id, accepted_by, created_at, and attachment.');
      } else {
        setupStatus.errors.push(`Error checking tasks table: ${tasksError.message}`);
        console.error('Error checking tasks table:', tasksError.message);
      }
    } else {
      console.log('Tasks table exists and has the required schema.');
      setupStatus.tasksTable = true;
    }

    // Determine if the schema is valid for app operation
    setupStatus.schemaValid = setupStatus.profilesTable && setupStatus.tasksTable;
    if (!setupStatus.schemaValid) {
      console.error('Database setup incomplete. The app may not function correctly. See errors above for details.');
    }

    return setupStatus;
  } catch (err) {
    console.error('Unexpected error during database setup:', err.message);
    setupStatus.errors.push(`Unexpected error during database setup: ${err.message}`);
    return setupStatus;
  }
};

module.exports = { supabase, setupDatabase, checkSupabaseConnection };