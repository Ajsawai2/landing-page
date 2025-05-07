const React = require('react');
const { useEffect, useState, useCallback } = React;
const { FontAwesomeIcon } = require('@fortawesome/react-fontawesome');
const {
  faRocket,
  faTasks,
  faClock,
  faMapMarkerAlt,
  faCheckCircle,
  faSyncAlt,
  faUserCheck,
  faSearch,
  faBookOpen,
  faBook,
  faPenNib,
  faLaptop,
  faUtensils,
  faBroom,
  faPrint,
  faMobileAlt,
  faSignOutAlt,
  faExclamationTriangle,
  faUser,
} = require('@fortawesome/free-solid-svg-icons');
const { supabase, checkSupabaseConnection, setupDatabase } = require('./supabase');

function App() {
  const [showModal, setShowModal] = useState(false);
  const [formType, setFormType] = useState(null);
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState({
    app: true,
    form: false,
    tasks: false,
  });
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    location: '',
    password: '',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const isConnected = await checkSupabaseConnection();
        if (!isConnected) {
          setConnectionStatus('disconnected');
          setError('Failed to connect to the server. Please check your internet connection.');
          return;
        }

        const isDatabaseSetup = await setupDatabase();
        if (!isDatabaseSetup) {
          setError('Failed to set up database. Please try again later or contact support.');
          setConnectionStatus('error');
          return;
        }

        setConnectionStatus('connected');

        const { data: { user }, error: sessionError } = await supabase.auth.getUser();
        if (sessionError) {
          console.error('Session error:', sessionError.message);
        }

        if (user) {
          setUser(user);
          await fetchUserProfile(user.id);
          await fetchTasks();
        } else {
          await fetchTasks();
        }

        if (!user) {
          const timer = setTimeout(() => {
            console.log('Showing modal after 5 seconds');
            setShowModal(true);
            setFormType('signup');
          }, 5000);
          return () => clearTimeout(timer);
        }
      } catch (err) {
        console.error('Initialization error:', err.message);
        setError(err.message || 'An unexpected error occurred during initialization.');
        setConnectionStatus('error');
      } finally {
        setLoading(prev => ({ ...prev, app: false }));
      }
    };

    initializeApp();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        const user = session?.user;
        setUser(user);
        await fetchUserProfile(user.id);
        await fetchTasks();
        setShowModal(false);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setTasks([]);
        await fetchTasks();
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      setUser(prev => ({
        ...prev,
        user_metadata: { ...prev.user_metadata, ...data }
      }));
    } catch (err) {
      console.error('Error fetching user profile:', err.message);
      setError('Failed to load user profile: ' + (err.message || 'Unknown error. Please try logging in again.'));
    }
  };

  const fetchTasks = async () => {
    setLoading(prev => ({ ...prev, tasks: true }));
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(8);

      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      console.error('Error fetching tasks:', err.message);
      setError('Failed to load tasks: ' + (err.message || 'Unknown error. Please try again later.'));
    } finally {
      setLoading(prev => ({ ...prev, tasks: false }));
    }
  };

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(prev => ({ ...prev, form: true }));

    try {
      console.log('Signup form data:', formData);

      if (!formData.username) {
        throw new Error('Please enter a username.');
      }
      if (!/^[a-zA-Z0-9]+$/.test(formData.username)) {
        throw new Error('Username must contain only letters and numbers.');
      }
      if (formData.username.length < 3) {
        throw new Error('Username must be at least 3 characters long.');
      }
      if (!formData.email) {
        throw new Error('Please enter an email address.');
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        throw new Error('Please enter a valid email address.');
      }
      if (!formData.phone) {
        throw new Error('Please enter a phone number.');
      }
      if (!/^\+?[1-9]\d{1,14}$/.test(formData.phone.replace(/[-()\s]/g, ''))) {
        throw new Error('Please enter a valid phone number (e.g., +1234567890 or 123-456-7890).');
      }
      if (!formData.location) {
        throw new Error('Location is required.');
      }
      if (formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long.');
      }

      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', formData.email)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Check email error:', checkError);
        throw new Error('Error checking email availability: ' + checkError.message);
      }
      if (existingUser) {
        throw new Error('Email already in use. Please use a different email or log in.');
      }

      const { data: existingUsername, error: usernameCheckError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', formData.username)
        .single();

      if (usernameCheckError && usernameCheckError.code !== 'PGRST116') {
        console.error('Check username error:', usernameCheckError);
        throw new Error('Error checking username availability: ' + usernameCheckError.message);
      }
      if (existingUsername) {
        throw new Error('Username already taken. Please choose a different username.');
      }

      const { data: existingPhone, error: phoneCheckError } = await supabase
        .from('profiles')
        .select('id')
        .eq('phone', formData.phone)
        .single();

      if (phoneCheckError && phoneCheckError.code !== 'PGRST116') {
        console.error('Check phone error:', phoneCheckError);
        throw new Error('Error checking phone availability: ' + phoneCheckError.message);
      }
      if (existingPhone) {
        throw new Error('Phone number already in use. Please use a different phone number.');
      }

      console.log('Attempting to sign up with Supabase Auth...');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { username: formData.username },
          emailRedirectTo: 'https://ziptasa.netlify.app/'
        }
      });

      if (authError) {
        console.error('Auth error:', authError);
        if (authError.message.includes('already registered')) {
          throw new Error('Email already in use. Please use a different email or log in.');
        }
        throw new Error('Signup failed: ' + authError.message);
      }

      console.log('Auth data:', authData);

      const userId = authData.user?.id;
      if (!userId) {
        throw new Error('User ID not returned after signup. Please try again.');
      }

      // Verify the user session after signup
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Session error after signup:', sessionError);
        throw new Error('Failed to retrieve session after signup: ' + sessionError.message);
      }
      console.log('Session data after signup:', sessionData);

      console.log('Calling create_user_profile with:', {
        p_id: userId,
        p_username: formData.username,
        p_location: formData.location,
        p_email: formData.email,
        p_phone: formData.phone
      });

      // Call the database function to create the profile
      const { data: profileData, error: profileError } = await supabase
        .rpc('create_user_profile', {
          p_id: userId,
          p_username: formData.username,
          p_location: formData.location,
          p_email: formData.email,
          p_phone: formData.phone
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        throw new Error('Failed to create profile: ' + profileError.message + '. Check Supabase logs for more details.');
      }

      console.log('Profile creation response:', profileData);

      setSuccess('Account created successfully! Please check your email (including spam/junk folder) to verify your account.');
      setFormData({ username: '', email: '', phone: '', location: '', password: '' });
      setFormType(null);
    } catch (err) {
      console.error('Signup error:', err.message);
      setError(err.message || 'Sign-up failed. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, form: false }));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(prev => ({ ...prev, form: true }));

    try {
      if (!formData.username || !formData.password) {
        throw new Error('Username and password are required.');
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('username', formData.username)
        .single();

      if (profileError || !profile) {
        throw new Error('Username not found.');
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password: formData.password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid username or password.');
        }
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Please verify your email before logging in. Check your inbox (and spam/junk folder) for the verification email.');
        }
        throw new Error('Login failed: ' + error.message);
      }

      setShowModal(false);
      setFormData({ username: '', email: '', phone: '', location: '', password: '' });
    } catch (err) {
      console.error('Login error:', err.message);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, form: false }));
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err) {
      console.error('Logout error:', err.message);
      setError('Failed to log out: ' + (err.message || 'Unknown error. Please try again.'));
    }
  };

  const createTask = async (taskData) => {
    if (!user) {
      setShowModal(true);
      setFormType('signup');
      return;
    }

    try {
      if (!taskData.title || !taskData.description || !taskData.location || !taskData.price) {
        throw new Error('All task fields (title, description, location, price) are required.');
      }
      const priceNum = parseFloat(taskData.price);
      if (isNaN(priceNum) || priceNum <= 0) {
        throw new Error('Price must be a positive number.');
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...taskData,
          user_id: user.id,
          status: 'open'
        })
        .select()
        .single();

      if (error) throw new Error('Task creation failed: ' + error.message);

      setTasks(prev => [data, ...prev]);
      setSuccess('Task posted successfully!');
      return data;
    } catch (err) {
      console.error('Error creating task:', err.message);
      setError(err.message || 'Failed to create task. Please try again.');
      return null;
    }
  };

  const acceptTask = async (taskId) => {
    if (!user) {
      setShowModal(true);
      setFormType('signup');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          status: 'accepted',
          accepted_by: user.id
        })
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw new Error('Task acceptance failed: ' + error.message);

      setTasks(prev => prev.map(task =>
        task.id === taskId ? data : task
      ));
      setSuccess('Task accepted successfully!');
    } catch (err) {
      console.error('Error accepting task:', err.message);
      setError(err.message || 'Failed to accept task. Please try again.');
    }
  };

  const closeModal = useCallback(() => {
    console.log('Closing modal');
    setShowModal(false);
    setFormType(null);
    setError(null);
    setSuccess(null);
    setFormData({ username: '', email: '', phone: '', location: '', password: '' });
  }, []);

  const renderForm = () => {
    console.log('Rendering form with formType:', formType);
    console.log('Current formData:', formData);
    return React.createElement(
      'form',
      {
        className: 'flex flex-col gap-4 text-left',
        onSubmit: formType === 'signup' ? handleSignUp : handleLogin
      },
      error && React.createElement(
        'div',
        { className: 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative' },
        error
      ),
      success && React.createElement(
        'div',
        { className: 'bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative' },
        success
      ),
      React.createElement('input', {
        type: 'text',
        name: 'username',
        placeholder: 'Username',
        className: 'border border-gray-300 rounded-md px-3 py-2 w-full',
        value: formData.username,
        onChange: handleInputChange,
        required: true
      }),
      formType === 'signup' && React.createElement('input', {
        type: 'email',
        name: 'email',
        placeholder: 'Email',
        className: 'border border-gray-300 rounded-md px-3 py-2 w-full',
        value: formData.email,
        onChange: handleInputChange,
        required: true
      }),
      formType === 'signup' && React.createElement('input', {
        type: 'tel',
        name: 'phone',
        placeholder: 'Phone Number (e.g., +1234567890)',
        className: 'border border-gray-300 rounded-md px-3 py-2 w-full',
        value: formData.phone,
        onChange: handleInputChange,
        required: true
      }),
      formType === 'signup' && React.createElement('input', {
        type: 'text',
        name: 'location',
        placeholder: 'Area/Location',
        className: 'border border-gray-300 rounded-md px-3 py-2 w-full',
        value: formData.location,
        onChange: handleInputChange,
        required: true
      }),
      React.createElement('input', {
        type: 'password',
        name: 'password',
        placeholder: 'Password',
        className: 'border border-gray-300 rounded-md px-3 py-2 w-full',
        value: formData.password,
        onChange: handleInputChange,
        required: true
      }),
      React.createElement(
        'button',
        {
          type: 'submit',
          className: 'bg-black text-white py-2 rounded-md hover:bg-purple-800 transition',
          disabled: loading.form
        },
        loading.form ? 'Processing...' : formType === 'signup' ? 'Sign Up' : 'Log In'
      ),
      React.createElement(
        'p',
        { className: 'text-sm text-center text-gray-500 mt-2' },
        formType === 'signup' ? [
          'Already have an account? ',
          React.createElement(
            'span',
            { className: 'text-purple-600 cursor-pointer', onClick: () => {
              console.log('Switching to login form');
              setFormType('login');
            }},
            'Log In'
          )
        ] : [
          "Don't have an account? ",
          React.createElement(
            'span',
            { className: 'text-purple-600 cursor-pointer', onClick: () => {
              console.log('Switching to signup form');
              setFormType('signup');
            }},
            'Sign Up'
          )
        ]
      )
    );
  };

  const cardGradients = [
    "from-blue-400 to-purple-500",
    "from-pink-500 to-purple-500",
    "from-orange-400 to-pink-500",
    "from-green-400 to-cyan-500",
    "from-yellow-400 to-red-400",
    "from-purple-500 to-indigo-500",
    "from-teal-400 to-blue-500",
    "from-red-400 to-pink-400",
  ];

  const taskIcons = {
    'Assignment Writing': faBookOpen,
    'Deliver Book to Friend': faBook,
    'Notes Digitization': faPenNib,
    'Online Research Help': faLaptop,
    'Food Pickup from Mess': faUtensils,
    'Room Cleanup Help': faBroom,
    'Print and Submit Docs': faPrint,
    'Phone Recharge Help': faMobileAlt,
    'default': faTasks
  };

  if (loading.app) {
    return React.createElement(
      'div',
      { className: 'flex items-center justify-center min-h-screen' },
      React.createElement('div', { className: 'animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500' })
    );
  }

  if (connectionStatus === 'disconnected' || connectionStatus === 'error') {
    return React.createElement(
      'div',
      { className: 'flex items-center justify-center min-h-screen p-4' },
      React.createElement(
        'div',
        { className: 'max-w-md text-center bg-white p-8 rounded-xl shadow-lg' },
        React.createElement(FontAwesomeIcon, { icon: faExclamationTriangle, className: 'text-red-500 text-5xl mb-4' }),
        React.createElement('h2', { className: 'text-2xl font-bold mb-2' }, 'Connection Error'),
        React.createElement('p', { className: 'mb-4' }, error || "We're having trouble connecting to our servers. Please check your internet connection and try again."),
        React.createElement(
          'button',
          {
            onClick: () => window.location.reload(),
            className: 'bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition'
          },
          'Retry Connection'
        )
      )
    );
  }

  return React.createElement(
    'div',
    { className: 'relative min-h-screen flex flex-col items-center font-sans overflow-hidden text-black' },
    React.createElement(
      'div',
      {
        className: 'absolute inset-0 -z-10',
        style: {
          animation: 'moveBg 20s ease-in-out infinite alternate',
          background: 'radial-gradient(circle at 50% 40%, rgba(255, 124, 209, 0.8), rgba(99, 194, 248, 0.47), transparent 50%), radial-gradient(circle at 70% 60%, rgba(142, 119, 255, 0.75), transparent 100%)',
          filter: 'blur(150px)',
          backgroundSize: '200% 200%',
        }
      }
    ),
    React.createElement(
      'div',
      { className: 'relative z-10 w-full' },
      React.createElement(
        'header',
        { className: 'w-full max-w-full flex justify-between items-center' },
        React.createElement(
          'h1',
          { className: 'text-4xl font-bold flex items-center bg-gradient-to-r from-yellow-400 to-pink-700 text-transparent bg-clip-text ml-5 mt-2' },
          'ZipTask'
        ),
        React.createElement(
          'div',
          { className: 'flex items-center mr-5 mt-2' },
          user ? [
            React.createElement('span', { className: 'mr-3 text-sm hidden sm:inline', key: 'username' }, `Hi, ${user.user_metadata?.username || 'User'}`),
            React.createElement(
              'button',
              {
                onClick: handleLogout,
                className: 'bg-black text-white px-4 py-2 rounded-xl shadow-md hover:opacity-90 flex items-center',
                key: 'logout'
              },
              React.createElement(FontAwesomeIcon, { icon: faSignOutAlt, className: 'mr-2' }),
              'Logout'
            )
          ] : React.createElement(
            'button',
            {
              onClick: () => {
                console.log('Get Started clicked, showing modal with signup form');
                setShowModal(true);
                setFormType('signup');
              },
              className: 'bg-black text-white px-4 py-2 rounded-xl shadow-md hover:opacity-90 flex items-center'
            },
            React.createElement(FontAwesomeIcon, { icon: faRocket, className: 'mr-2' }),
            'Get Started'
          )
        )
      ),
      React.createElement(
        'main',
        { className: 'text-center mt-10 max-w-3xl mx-auto' },
        user ? [
          React.createElement(
            'div',
            { className: 'bg-white p-6 rounded-2xl shadow-lg mb-8', key: 'profile' },
            React.createElement(
              'div',
              { className: 'flex items-center justify-center mb-4' },
              React.createElement(FontAwesomeIcon, { icon: faUser, className: 'text-4xl text-purple-600 mr-3' })
            ),
            React.createElement('h2', { className: 'text-3xl font-bold mb-2' }, `Welcome, ${user.user_metadata?.username || 'User'}!`),
            React.createElement('p', { className: 'text-gray-700 mb-2' }, `Email: ${user.user_metadata?.email || 'Not available'}`),
            React.createElement('p', { className: 'text-gray-700 mb-2' }, `Phone: ${user.user_metadata?.phone || 'Not available'}`),
            React.createElement('p', { className: 'text-gray-700' }, `Location: ${user.user_metadata?.location || 'Not specified'}`)
          )
        ] : [
          React.createElement('h2', { className: 'text-4xl md:text-5xl font-bold leading-tight text-black', key: 'title' }, 'ZipTask — Your Hyperlocal Task Marketplace'),
          React.createElement('p', { className: 'mt-4 text-gray-700', key: 'desc' }, 'Connect with nearby people to get things done quickly — whether online or offline.')
        ],
        React.createElement(
          'div',
          { className: 'mt-6 flex justify-center space-x-4' },
          React.createElement(
            'button',
            {
              onClick: () => {
                if (!user) {
                  console.log('Post a Task clicked, showing modal with signup form');
                  setShowModal(true);
                  setFormType('signup');
                  return;
                }
                createTask({
                  title: 'Sample Task',
                  description: 'This is a sample task created by the system',
                  location: 'Sample Location',
                  price: '100',
                  category: 'general'
                });
              },
              className: 'bg-black hover:bg-purple-100 hover:text-black hover:scale-105 hover:shadow-xl transition duration-300 transform px-6 py-3 text-white rounded-xl shadow-lg flex items-center'
            },
            React.createElement(FontAwesomeIcon, { icon: faTasks, className: 'mr-2' }),
            'Post a Task'
          ),
          React.createElement(
            'button',
            { className: 'border border-purple-500 text-black px-6 py-3 rounded-xl hover:bg-purple-100 flex items-center' },
            React.createElement(FontAwesomeIcon, { icon: faSearch, className: 'mr-2' }),
            'Find Tasks'
          )
        )
      ),
      React.createElement(
        'section',
        { className: 'mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-center max-w-5xl mx-auto' },
        React.createElement(
          'div',
          null,
          React.createElement(
            'h3',
            { className: 'text-3xl font-semibold flex justify-center items-center text-black' },
            React.createElement(FontAwesomeIcon, { icon: faTasks, className: 'mr-2' }),
            `${tasks.length}+`
          ),
          React.createElement('p', { className: 'text-gray-600' }, 'Tasks Available')
        ),
        React.createElement(
          'div',
          null,
          React.createElement(
            'h3',
            { className: 'text-3xl font-semibold flex justify-center items-center text-black' },
            React.createElement(FontAwesomeIcon, { icon: faUserCheck, className: 'mr-2' }),
            '200+'
          ),
          React.createElement('p', { className: 'text-gray-600' }, 'Active Users')
        ),
        React.createElement(
          'div',
          null,
          React.createElement(
            'h3',
            { className: 'text-3xl font-semibold flex justify-center items-center text-black' },
            React.createElement(FontAwesomeIcon, { icon: faRocket, className: 'mr-2' }),
            '₹ Instant'
          ),
          React.createElement('p', { className: 'text-gray-600' }, 'Payments')
        )
      ),
      React.createElement(
        'section',
        { className: 'mt-12 grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl w-full px-4 mx-auto' },
        [
          { title: 'One-Hour Tasks', desc: 'Quick and easy jobs', icon: faClock },
          { title: 'Nearby Helpers', desc: 'Local task assistance', icon: faMapMarkerAlt },
          { title: 'Verified Users', desc: 'Trusted and secure profiles', icon: faCheckCircle },
          { title: 'Flexible Options', desc: 'Online and offline work', icon: faSyncAlt },
        ].map((feature, idx) =>
          React.createElement(
            'div',
            {
              key: idx,
              className: `bg-gradient-to-br ${cardGradients[idx % cardGradients.length]} text-white rounded-2xl p-6 shadow-lg text-center shadow-purple-400 transition-all`
            },
            React.createElement('div', { className: 'text-3xl mb-2' }, React.createElement(FontAwesomeIcon, { icon: feature.icon })),
            React.createElement('h4', { className: 'text-lg font-semibold' }, feature.title),
            React.createElement('p', { className: 'text-sm' }, feature.desc)
          )
        )
      ),
      React.createElement(
        'section',
        { className: 'mt-16 max-w-6xl w-full px-4 mx-auto' },
        React.createElement('h2', { className: 'text-3xl font-bold text-center text-black mb-6' }, 'Nearby Tasks'),
        loading.tasks ? React.createElement(
          'div',
          { className: 'flex justify-center items-center h-40' },
          React.createElement('div', { className: 'animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500' })
        ) : React.createElement(
          'div',
          { className: 'w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-slide-in mb-10' },
          tasks.length > 0 ? tasks.map((task, idx) =>
            React.createElement(
              'div',
              {
                key: task.id,
                className: `bg-gradient-to-br ${cardGradients[idx % cardGradients.length]} text-black rounded-2xl p-5 shadow-md hover:shadow-xl transition duration-300 transform hover:scale-105 flex flex-col justify-between`
              },
              React.createElement(
                'div',
                null,
                React.createElement('div', { className: 'text-4xl mb-3' }, React.createElement(FontAwesomeIcon, { icon: taskIcons[task.title] || taskIcons.default })),
                React.createElement('h3', { className: 'text-xl font-semibold mb-1' }, task.title),
                React.createElement('p', { className: 'text-sm' }, React.createElement(FontAwesomeIcon, { icon: faMapMarkerAlt, className: 'mr-1' }), task.location),
                React.createElement('p', { className: 'font-bold mt-2' }, `₹${task.price}`),
                task.status === 'accepted' && React.createElement('p', { className: 'text-xs mt-1 text-white bg-black px-2 py-1 rounded-full inline-block' }, 'Accepted')
              ),
              React.createElement(
                'button',
                {
                  onClick: () => acceptTask(task.id),
                  disabled: task.status === 'accepted',
                  className: `mt-4 py-2 px-4 rounded-xl transition ${task.status === 'accepted' ? 'bg-gray-400 cursor-not-allowed' : 'bg-black text-white hover:bg-purple-800'}`
                },
                task.status === 'accepted' ? 'Task Taken' : 'Accept Task'
              )
            )
          ) : React.createElement('div', { className: 'col-span-full text-center py-10 text-gray-500' }, 'No tasks available at the moment. Check back later!')
        )
      ),
      React.createElement(
        'footer',
        { className: 'w-full text-center py-6 bg-gradient-to-r from-purple-600 to-pink-500 text-white mt-auto' },
        React.createElement(
          'div',
          null,
          React.createElement('p', { className: 'text-sm' }, `© ${new Date().getFullYear()} ZipTask. All rights reserved.`),
          React.createElement('p', { className: 'text-xs mt-1' }, 'Built for local communities and student networks')
        )
      )
    ),
    showModal && React.createElement(
      'div',
      { className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50' },
      React.createElement(
        'div',
        { className: 'bg-white p-6 rounded-2xl w-96 shadow-xl relative text-center' },
        React.createElement(
          'button',
          { className: 'absolute top-2 right-4 text-gray-500 hover:text-gray-800 text-xl', onClick: closeModal },
          '×'
        ),
        console.log('Modal state:', { showModal, formType }),
        formType ? [
          React.createElement('h2', { className: 'text-2xl font-bold mb-4', key: 'title' }, formType === 'signup' ? 'Create Account' : 'Log In'),
          renderForm()
        ] : [
          React.createElement('h2', { className: 'text-2xl font-bold mb-4', key: 'welcome' }, 'Welcome to ZipTask!'),
          React.createElement('p', { className: 'text-sm mb-6 text-gray-600', key: 'desc' }, 'Sign up or log in to get started with posting and accepting tasks nearby.'),
          React.createElement(
            'div',
            { className: 'flex flex-col gap-3', key: 'buttons' },
            React.createElement(
              'button',
              { 
                className: 'bg-black text-white py-2 px-4 rounded-xl hover:bg-purple-800 transition', 
                onClick: () => {
                  console.log('Sign Up button clicked, setting formType to signup');
                  setFormType('signup');
                }
              },
              'Sign Up'
            ),
            React.createElement(
              'button',
              { 
                className: 'border border-gray-400 py-2 px-4 rounded-xl hover:bg-gray-100 transition', 
                onClick: () => {
                  console.log('Log In button clicked, setting formType to login');
                  setFormType('login');
                }
              },
              'Log In'
            )
          )
        ]
      )
    ),
    React.createElement(
      'style',
      null,
      `
        @keyframes moveBg {
          0% { background-position: 0% 0%; }
          100% { background-position: 100% 100%; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in {
          animation: slideIn 1s ease-out;
        }
      `
    )
  );
}

module.exports = App;