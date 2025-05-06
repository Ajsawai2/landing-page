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
      Accept: 'application/json', // Explicitly set Accept header to prevent 406 errors
    },
  },
});

const retryOperation = async (operation, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await operation();
        } catch (err) {
            if (i === retries - 1) throw err;
            console.warn(`Retry ${i + 1}/${retries} failed: ${err.message}. Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};

const setupDatabase = async () => {
    try {
        let { error: profilesError } = await retryOperation(() =>
            supabase.from('profiles').select('id').limit(1)
        );

        if (profilesError && profilesError.code === '42P01') {
            console.log('Profiles table does not exist. Creating...');
            const { error: createProfilesError } = await retryOperation(() =>
                supabase.rpc('execute_sql', {
                    sql: `
                        CREATE TABLE public.profiles (
                            id UUID PRIMARY KEY,
                            username TEXT NOT NULL UNIQUE,
                            location TEXT,
                            email TEXT NOT NULL UNIQUE,
                            created_at TIMESTAMP DEFAULT NOW()
                        );

                        CREATE INDEX idx_profiles_email ON public.profiles(email);

                        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

                        CREATE POLICY "Allow anon read access to profiles" ON public.profiles
                        FOR SELECT USING (true);

                        CREATE POLICY "Allow insert for authenticated users" ON public.profiles
                        FOR INSERT WITH CHECK (auth.uid() = id);

                        CREATE POLICY "Users can update own profile" ON public.profiles
                        FOR UPDATE USING (auth.uid() = id);
                    `
                })
            );
            if (createProfilesError) {
                console.error('Failed to create profiles table:', createProfilesError.message);
                throw new Error(`Failed to create profiles table: ${createProfilesError.message}. Check Supabase logs for details.`);
            }
            console.log('Profiles table and policies created successfully.');
        } else if (profilesError) {
            console.error('Error checking profiles table:', profilesError.message);
            throw new Error(`Error checking profiles table: ${profilesError.message}. Check Supabase logs for details.`);
        } else {
            console.log('Profiles table already exists.');
        }

        let { error: tasksError } = await retryOperation(() =>
            supabase.from('tasks').select('id').limit(1)
        );

        if (tasksError && tasksError.code === '42P01') {
            console.log('Tasks table does not exist. Creating...');
            const { error: createTasksError } = await retryOperation(() =>
                supabase.rpc('execute_sql', {
                    sql: `
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
                            created_at TIMESTAMP DEFAULT NOW()
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
                    `
                })
            );
            if (createTasksError) {
                console.error('Failed to create tasks table:', createTasksError.message);
                throw new Error(`Failed to create tasks table: ${createTasksError.message}. Check Supabase logs for details.`);
            }
            console.log('Tasks table and policies created successfully.');
        } else if (tasksError) {
            console.error('Error checking tasks table:', tasksError.message);
            throw new Error(`Error checking tasks table: ${tasksError.message}. Check Supabase logs for details.`);
        } else {
            console.log('Tasks table already exists.');
        }

        return true;
    } catch (err) {
        console.error('Error setting up database:', err.message);
        return false;
    }
};

const checkSupabaseConnection = async () => {
    try {
        const { error } = await supabase.from('profiles').select('id').limit(1);
        if (error) {
            if (error.code === '42P01') {
                return true; // Table doesn't exist yet, but connection is fine
            }
            if (error.code === '401') {
                console.warn('Unauthorized access during connection check. Check RLS policies and anon key.');
                return false;
            }
            throw error;
        }
        return true;
    } catch (err) {
        console.error('Supabase connection failed:', err.message);
        return false;
    }
};

module.exports = { supabase, setupDatabase, checkSupabaseConnection };