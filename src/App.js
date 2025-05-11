const React = require('react');
const { useEffect, useState, useCallback, useMemo, memo } = React;
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
  faGlobe,
  faHome,
  faPaperclip,
  faSync,
} = require('@fortawesome/free-solid-svg-icons');
const { supabase, checkSupabaseConnection, setupDatabase } = require('./supabase');

// Mock data for fallback
const mockTasks = [
  { id: 'mock1', title: 'Mock Task 1', description: 'This is a mock task', location: 'Mock Location', price: '100', category: 'offline', status: 'open', user_id: 'mock_user', created_at: new Date().toISOString(), attachment: null },
  { id: 'mock2', title: 'Mock Task 2', description: 'Another mock task', location: 'Mock Location', price: '150', category: 'online', status: 'open', user_id: 'mock_user', created_at: new Date().toISOString(), attachment: null },
];

// Memoized TaskCreationForm
const TaskCreationForm = memo(({ createTask, setShowModal, loading, error, success }) => {
  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: '',
    location: '',
    price: '',
    category: '',
    attachment: null,
  });

  const handleTaskInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setTaskFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit.');
        return;
      }
      setTaskFormData(prev => ({ ...prev, attachment: file.name }));
    }
  }, []);

  const handleTaskSubmit = useCallback(async (e) => {
    e.preventDefault();
    const result = await createTask({
      title: taskFormData.title,
      description: taskFormData.description,
      location: taskFormData.location,
      price: taskFormData.price,
      category: taskFormData.category,
      attachment: taskFormData.attachment,
    });
    if (result) {
      setTaskFormData({ title: '', description: '', location: '', price: '', category: '', attachment: null });
      setShowModal(false);
    }
  }, [createTask, setShowModal, taskFormData]);

  return React.createElement(
    'form',
    { className: 'flex flex-col gap-4 text-left', onSubmit: handleTaskSubmit },
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
      name: 'title',
      placeholder: 'Task Title',
      className: 'border border-gray-300 rounded-md px-3 py-2 w-full',
      value: taskFormData.title,
      onChange: handleTaskInputChange,
      required: true
    }),
    React.createElement('textarea', {
      name: 'description',
      placeholder: 'Task Description',
      className: 'border border-gray-300 rounded-md px-3 py-2 w-full',
      value: taskFormData.description,
      onChange: handleTaskInputChange,
      required: true
    }),
    React.createElement('input', {
      type: 'text',
      name: 'location',
      placeholder: 'Task Location',
      className: 'border border-gray-300 rounded-md px-3 py-2 w-full',
      value: taskFormData.location,
      onChange: handleTaskInputChange,
      required: true
    }),
    React.createElement('input', {
      type: 'number',
      name: 'price',
      placeholder: 'Price (₹)',
      className: 'border border-gray-300 rounded-md px-3 py-2 w-full',
      value: taskFormData.price,
      onChange: handleTaskInputChange,
      required: true
    }),
    React.createElement(
      'select',
      {
        name: 'category',
        className: 'border border-gray-300 rounded-md px-3 py-2 w-full',
        value: taskFormData.category,
        onChange: handleTaskInputChange,
        required: true
      },
      React.createElement('option', { value: '' }, 'Select Category'),
      React.createElement('option', { value: 'online' }, 'Online'),
      React.createElement('option', { value: 'offline' }, 'Offline')
    ),
    React.createElement(
      'div',
      { className: 'flex items-center gap-2' },
      React.createElement(FontAwesomeIcon, { icon: faPaperclip, className: 'text-gray-500' }),
      React.createElement('input', {
        type: 'file',
        name: 'attachment',
        className: 'border border-gray-300 rounded-md px-3 py-2 w-full',
        onChange: handleFileChange,
        accept: 'image/*,application/pdf'
      })
    ),
    taskFormData.attachment && React.createElement(
      'p',
      { className: 'text-sm text-gray-600' },
      `Attached: ${taskFormData.attachment} (Note: File upload requires backend storage setup)`
    ),
    React.createElement(
      'button',
      {
        type: 'submit',
        className: 'bg-black text-white py-2 rounded-md hover:bg-purple-800 transition flex items-center justify-center',
        disabled: loading.form
      },
      loading.form ? (
        React.createElement('div', { className: 'flex items-center' },
          React.createElement('div', { className: 'animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2' }),
          'Posting...'
        )
      ) : 'Post Task'
    )
  );
});

// Memoized TaskCard
const TaskCard = memo(({ task, idx, acceptTask, user, cardGradients, taskIcons, faMapMarkerAlt }) => {
  return React.createElement(
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
      task.attachment && React.createElement('p', { className: 'text-xs mt-1 text-gray-600' }, `Attachment: ${task.attachment}`),
      task.status === 'accepted' && React.createElement('p', { className: 'text-xs mt-1 text-white bg-black px-2 py-1 rounded-full inline-block' }, 'Accepted')
    ),
    React.createElement(
      'button',
      {
        onClick: () => acceptTask(task.id),
        disabled: task.status === 'accepted' || task.accepted_by === user?.id,
        className: `mt-4 py-2 px-4 rounded-xl transition ${task.status === 'accepted' || task.accepted_by === user?.id ? 'bg-gray-400 cursor-not-allowed' : 'bg-black text-white hover:bg-purple-800'}`
      },
      task.status === 'accepted' || task.accepted_by === user?.id ? 'Task Taken' : 'Accept Task'
    )
  );
});

function App() {
  const [showModal, setShowModal] = useState(false);
  const [formType, setFormType] = useState(null);
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [userTasks, setUserTasks] = useState([]);
  const [acceptedTasks, setAcceptedTasks] = useState([]);
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
  const [isOffline, setIsOffline] = useState(false);
  const [isMockMode, setIsMockMode] = useState(false);
  const [useJsonServer, setUseJsonServer] = useState(false);
  const [useCachedData, setUseCachedData] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const cardGradients = useMemo(() => [
    "from-blue-400 to-purple-500",
    "from-pink-500 to-purple-500",
    "from-orange-400 to-pink-500",
    "from-green-400 to-cyan-500",
    "from-yellow-400 to-red-400",
    "from-purple-500 to-indigo-500",
    "from-teal-400 to-blue-500",
    "from-red-400 to-pink-400",
  ], []);

  const taskIcons = useMemo(() => ({
    'Assignment Writing': faBookOpen,
    'Deliver Book to Friend': faBook,
    'Notes Digitization': faPenNib,
    'Online Research Help': faLaptop,
    'Food Pickup from Mess': faUtensils,
    'Room Cleanup Help': faBroom,
    'Print and Submit Docs': faPrint,
    'Phone Recharge Help': faMobileAlt,
    'default': faTasks
  }), []);

  const offlineTaskCategories = useMemo(() => [
    'Deliver Book to Friend',
    'Food Pickup from Mess',
    'Room Cleanup Help',
    'Print and Submit Docs',
    'Phone Recharge Help'
  ], []);

  const onlineTaskCategories = useMemo(() => [
    'Assignment Writing',
    'Notes Digitization',
    'Online Research Help'
  ], []);

  const cacheTasks = useCallback((tasks, userTasks, acceptedTasks) => {
    localStorage.setItem('cachedTasks', JSON.stringify(tasks));
    localStorage.setItem('cachedUserTasks', JSON.stringify(userTasks));
    localStorage.setItem('cachedAcceptedTasks', JSON.stringify(acceptedTasks));
  }, []);

  const loadCachedTasks = useCallback(() => {
    const cachedTasks = JSON.parse(localStorage.getItem('cachedTasks') || '[]');
    const cachedUserTasks = JSON.parse(localStorage.getItem('cachedUserTasks') || '[]');
    const cachedAcceptedTasks = JSON.parse(localStorage.getItem('cachedAcceptedTasks') || '[]');
    return { cachedTasks, cachedUserTasks, cachedAcceptedTasks };
  }, []);

  const cacheUserProfile = useCallback((user) => {
    localStorage.setItem('cachedUser', JSON.stringify(user));
  }, []);

  const loadCachedUserProfile = useCallback(() => {
    return JSON.parse(localStorage.getItem('cachedUser') || 'null');
  }, []);

  const checkSupabaseConnectionWithRetry = useCallback(async (retries = 3, initialDelay = 2000) => {
    let delay = initialDelay;
    for (let i = 0; i < retries; i++) {
      console.log(`Attempt ${i + 1} to connect to Supabase...`);
      try {
        const isConnected = await checkSupabaseConnection();
        if (isConnected) {
          console.log('Supabase connection successful');
          return true;
        }
        console.log('Supabase connection failed, retrying...');
      } catch (err) {
        console.error('Supabase connection error:', err.message);
      }
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
      }
    }
    console.log('All Supabase connection attempts failed');
    return false;
  }, []);

  const checkJsonServerConnection = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3001/tasks');
      if (!response.ok) throw new Error('JSON server not responding');
      console.log('JSON server connection successful');
      return true;
    } catch (err) {
      console.error('JSON server connection failed:', err.message);
      return false;
    }
  }, []);

  const fetchAllTasks = useCallback(async (userId) => {
    if (isOffline || isMockMode) {
      console.log('Offline or mock mode: Using cached or mock tasks');
      const { cachedTasks, cachedUserTasks, cachedAcceptedTasks } = loadCachedTasks();
      setTasks(cachedTasks.length > 0 ? cachedTasks : mockTasks);
      setUserTasks(cachedUserTasks);
      setAcceptedTasks(cachedAcceptedTasks);
      return;
    }

    setLoading(prev => ({ ...prev, tasks: true }));
    try {
      let tasksData = [], userTasksData = [], acceptedTasksData = [];
      if (useJsonServer) {
        [tasksData, userTasksData, acceptedTasksData] = await Promise.all([
          fetch('http://localhost:3001/tasks?_sort=created_at&_order=desc&_limit=8').then(res => res.json()),
          userId ? fetch(`http://localhost:3001/tasks?user_id=${userId}&_sort=created_at&_order=desc`).then(res => res.json()) : Promise.resolve([]),
          userId ? fetch(`http://localhost:3001/tasks?accepted_by=${userId}&_sort=created_at&_order=desc`).then(res => res.json()) : Promise.resolve([]),
        ]);
      } else {
        const [tasksRes, userTasksRes, acceptedTasksRes] = await Promise.all([
          supabase.from('tasks').select('*').order('created_at', { ascending: false }).limit(8),
          userId ? supabase.from('tasks').select('*').eq('user_id', userId).order('created_at', { ascending: false }) : Promise.resolve({ data: [] }),
          userId ? supabase.from('tasks').select('*').eq('accepted_by', userId).order('created_at', { ascending: false }) : Promise.resolve({ data: [] }),
        ]);

        if (tasksRes.error) throw tasksRes.error;
        if (userTasksRes.error) throw userTasksRes.error;
        if (acceptedTasksRes.error) throw acceptedTasksRes.error;

        tasksData = tasksRes.data;
        userTasksData = userTasksRes.data;
        acceptedTasksData = acceptedTasksRes.data;
      }

      setTasks(tasksData || []);
      setUserTasks(userTasksData || []);
      setAcceptedTasks(acceptedTasksData || []);
      cacheTasks(tasksData, userTasksData, acceptedTasksData);
      setUseCachedData(false);
    } catch (err) {
      console.error('Error fetching tasks:', err.message);
      setError('Failed to load tasks: ' + (err.message || 'Unknown error.'));
      const { cachedTasks, cachedUserTasks, cachedAcceptedTasks } = loadCachedTasks();
      setTasks(cachedTasks.length > 0 ? cachedTasks : mockTasks);
      setUserTasks(cachedUserTasks);
      setAcceptedTasks(cachedAcceptedTasks);
      setUseCachedData(true);
    } finally {
      setLoading(prev => ({ ...prev, tasks: false }));
    }
  }, [isOffline, isMockMode, useJsonServer, cacheTasks, loadCachedTasks]);

  const fetchUserProfile = useCallback(async (userId) => {
    if (isOffline || isMockMode) {
      console.log('Offline or mock mode: Using cached user profile');
      const cachedUser = loadCachedUserProfile();
      if (cachedUser) setUser(cachedUser);
      return;
    }
    try {
      let profile;
      if (useJsonServer) {
        profile = await fetch(`http://localhost:3001/profiles/${userId}`).then(res => res.json());
      } else {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        if (error) throw error;
        profile = data;
      }
      setUser(prev => {
        const updatedUser = { ...prev, user_metadata: { ...prev.user_metadata, ...profile } };
        cacheUserProfile(updatedUser);
        return updatedUser;
      });
    } catch (err) {
      console.error('Error fetching user profile:', err.message);
      setError('Failed to load user profile: ' + (err.message || 'Unknown error.'));
      const cachedUser = loadCachedUserProfile();
      if (cachedUser) setUser(cachedUser);
      else setIsMockMode(true);
    }
  }, [isOffline, isMockMode, useJsonServer, cacheUserProfile, loadCachedUserProfile]);

  const retryConnection = useCallback(async () => {
    setLoading(prev => ({ ...prev, app: true }));
    setError(null);
    setConnectionStatus('connecting');
    setIsOffline(false);
    setIsMockMode(false);
    setUseJsonServer(false);
    setUseCachedData(false);

    const isSupabaseConnected = await checkSupabaseConnectionWithRetry();
    if (!isSupabaseConnected) {
      const isJsonServerConnected = await checkJsonServerConnection();
      if (isJsonServerConnected) {
        setUseJsonServer(true);
        setConnectionStatus('connected');
        setError('Failed to connect to Supabase. Using local JSON server.');
      } else {
        setConnectionStatus('disconnected');
        setIsOffline(true);
        setUseCachedData(true);
        setError('Failed to connect to any server. Using cached data.');
        const { cachedTasks, cachedUserTasks, cachedAcceptedTasks } = loadCachedTasks();
        setTasks(cachedTasks.length > 0 ? cachedTasks : mockTasks);
        setUserTasks(cachedUserTasks);
        setAcceptedTasks(cachedAcceptedTasks);
        const cachedUser = loadCachedUserProfile();
        if (cachedUser) setUser(cachedUser);
        return;
      }
    } else {
      const isDatabaseSetup = await setupDatabase();
      if (!isDatabaseSetup) {
        setError('Failed to set up database. Some features may not work properly.');
      }
      setConnectionStatus('connected');
    }

    if (user) {
      await fetchUserProfile(user.id);
      await fetchAllTasks(user.id);
    } else {
      await fetchAllTasks(null);
    }
    setLoading(prev => ({ ...prev, app: false }));
  }, [checkSupabaseConnectionWithRetry, checkJsonServerConnection, fetchUserProfile, fetchAllTasks, user, loadCachedTasks, loadCachedUserProfile]);

  useEffect(() => {
    console.log('Starting app initialization...');
    const initializeApp = async () => {
      try {
        const isSupabaseConnected = await checkSupabaseConnectionWithRetry();
        if (!isSupabaseConnected) {
          const isJsonServerConnected = await checkJsonServerConnection();
          if (isJsonServerConnected) {
            setUseJsonServer(true);
            setConnectionStatus('connected');
            setError('Failed to connect to Supabase. Using local JSON server.');
          } else {
            setConnectionStatus('disconnected');
            setIsOffline(true);
            setUseCachedData(true);
            setError('Failed to connect to any server. Using cached data.');
            const { cachedTasks, cachedUserTasks, cachedAcceptedTasks } = loadCachedTasks();
            setTasks(cachedTasks.length > 0 ? cachedTasks : mockTasks);
            setUserTasks(cachedUserTasks);
            setAcceptedTasks(cachedAcceptedTasks);
            const cachedUser = loadCachedUserProfile();
            if (cachedUser) setUser(cachedUser);
            return;
          }
        } else {
          const isDatabaseSetup = await setupDatabase();
          if (!isDatabaseSetup) {
            setError('Failed to set up database. Some features may not work properly.');
          }
          setConnectionStatus('connected');
        }

        let fetchedUser = null;
        if (!useJsonServer) {
          try {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) {
              console.error('Session error:', error.message);
              if (error.message.includes('Auth session missing')) {
                console.log('No user session found, proceeding as guest...');
                setUser(null);
              } else {
                throw error;
              }
            } else {
              fetchedUser = user;
              setUser(fetchedUser);
              cacheUserProfile(fetchedUser);
            }
          } catch (err) {
            console.error('Error fetching user session:', err.message);
            setError('Failed to fetch user session: ' + err.message);
            setUser(null);
          }
        } else {
          fetchedUser = { id: 'mock_user', user_metadata: { username: 'testuser' } };
          setUser(fetchedUser);
          cacheUserProfile(fetchedUser);
        }

        await fetchAllTasks(fetchedUser?.id || null);
        if (fetchedUser) await fetchUserProfile(fetchedUser.id);
        else {
          const timer = setTimeout(() => {
            setShowModal(true);
            setFormType('signup');
          }, 5000);
          return () => clearTimeout(timer);
        }
      } catch (err) {
        console.error('Initialization error:', err.message);
        setError(err.message || 'An unexpected error occurred during initialization.');
        setConnectionStatus('error');
        setIsOffline(true);
        setUseCachedData(true);
        const { cachedTasks, cachedUserTasks, cachedAcceptedTasks } = loadCachedTasks();
        setTasks(cachedTasks.length > 0 ? cachedTasks : mockTasks);
        setUserTasks(cachedUserTasks);
        setAcceptedTasks(cachedAcceptedTasks);
        const cachedUser = loadCachedUserProfile();
        if (cachedUser) setUser(cachedUser);
      } finally {
        setLoading(prev => ({ ...prev, app: false }));
      }
    };

    const timeout = setTimeout(() => {
      setLoading(prev => ({ ...prev, app: false }));
      setError('Initialization took too long. Using cached data.');
      setConnectionStatus('error');
      setIsOffline(true);
      setUseCachedData(true);
      const { cachedTasks, cachedUserTasks, cachedAcceptedTasks } = loadCachedTasks();
      setTasks(cachedTasks.length > 0 ? cachedTasks : mockTasks);
      setUserTasks(cachedUserTasks);
      setAcceptedTasks(cachedAcceptedTasks);
      const cachedUser = loadCachedUserProfile();
      if (cachedUser) setUser(cachedUser);
    }, 20000);

    initializeApp().catch(err => {
      console.error('Unhandled error in initializeApp:', err);
      setLoading(prev => ({ ...prev, app: false }));
      setError('An unexpected error occurred: ' + (err.message || 'Unknown error.'));
      setConnectionStatus('error');
      setIsOffline(true);
      setUseCachedData(true);
      const { cachedTasks, cachedUserTasks, cachedAcceptedTasks } = loadCachedTasks();
      setTasks(cachedTasks.length > 0 ? cachedTasks : mockTasks);
      setUserTasks(cachedUserTasks);
      setAcceptedTasks(cachedAcceptedTasks);
      const cachedUser = loadCachedUserProfile();
      if (cachedUser) setUser(cachedUser);
    });

    const authListener = useJsonServer ? null : supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session);
      if (event === 'SIGNED_IN') {
        const user = session?.user;
        setUser(user);
        cacheUserProfile(user);
        await fetchUserProfile(user.id);
        await fetchAllTasks(user.id);
        setShowModal(false);
        setIsOffline(false);
        setIsMockMode(false);
        setUseCachedData(false);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setTasks([]);
        setUserTasks([]);
        setAcceptedTasks([]);
        await fetchAllTasks(null);
      }
    });

    return () => {
      clearTimeout(timeout);
      if (authListener?.subscription) authListener.subscription.unsubscribe();
    };
  }, [fetchUserProfile, fetchAllTasks, checkSupabaseConnectionWithRetry, checkJsonServerConnection, useJsonServer, cacheUserProfile]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSignUp = useCallback(async (e) => {
    e.preventDefault();
    if (isOffline || isMockMode || useJsonServer) {
      setError('Sign-up not supported in offline, mock, or JSON server mode.');
      return;
    }
    setError(null);
    setSuccess(null);
    setLoading(prev => ({ ...prev, form: true }));

    try {
      if (!formData.username) throw new Error('Please enter a username.');
      if (!/^[a-zA-Z0-9]+$/.test(formData.username)) throw new Error('Username must contain only letters and numbers.');
      if (formData.username.length < 3) throw new Error('Username must be at least 3 characters long.');
      if (!formData.email) throw new Error('Please enter an email address.');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) throw new Error('Please enter a valid email address.');
      if (!formData.phone) throw new Error('Please enter a phone number.');
      if (!/^\+?[1-9]\d{1,14}$/.test(formData.phone.replace(/[-()\s]/g, ''))) throw new Error('Please enter a valid phone number.');
      if (!formData.location) throw new Error('Location is required.');
      if (formData.password.length < 6) throw new Error('Password must be at least 6 characters long.');

      const [existingUserRes, existingUsernameRes, existingPhoneRes] = await Promise.all([
        supabase.from('profiles').select('id').eq('email', formData.email).single(),
        supabase.from('profiles').select('id').eq('username', formData.username).single(),
        supabase.from('profiles').select('id').eq('phone', formData.phone).single(),
      ]);

      if (existingUserRes.error && existingUserRes.error.code !== 'PGRST116') throw new Error('Error checking email: ' + existingUserRes.error.message);
      if (existingUserRes.data) throw new Error('Email already in use.');
      if (existingUsernameRes.error && existingUsernameRes.error.code !== 'PGRST116') throw new Error('Error checking username: ' + existingUsernameRes.error.message);
      if (existingUsernameRes.data) throw new Error('Username already taken.');
      if (existingPhoneRes.error && existingPhoneRes.error.code !== 'PGRST116') throw new Error('Error checking phone: ' + existingPhoneRes.error.message);
      if (existingPhoneRes.data) throw new Error('Phone number already in use.');

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { username: formData.username },
          emailRedirectTo: 'https://ziptasa.netlify.app/'
        }
      });

      if (authError) throw new Error('Signup failed: ' + authError.message);

      const userId = authData.user?.id;
      if (!userId) throw new Error('User ID not returned after signup.');

      const { error: profileError } = await supabase
        .rpc('create_user_profile', {
          p_id: userId,
          p_username: formData.username,
          p_location: formData.location,
          p_email: formData.email,
          p_phone: formData.phone
        });

      if (profileError) throw new Error('Failed to create profile: ' + profileError.message);

      setSuccess('Account created successfully! Please check your email to verify.');
      setFormData({ username: '', email: '', phone: '', location: '', password: '' });
      setFormType(null);
    } catch (err) {
      console.error('Signup error:', err.message);
      setError(err.message || 'Sign-up failed.');
      setIsMockMode(true);
    } finally {
      setLoading(prev => ({ ...prev, form: false }));
    }
  }, [formData, isOffline, isMockMode, useJsonServer]);

  const handleLogin = useCallback(async (e) => {
    e.preventDefault();
    if (isOffline || isMockMode || useJsonServer) {
      setError('Login not supported in offline, mock, or JSON server mode.');
      return;
    }
    setError(null);
    setLoading(prev => ({ ...prev, form: true }));

    try {
      if (!formData.username || !formData.password) throw new Error('Username and password are required.');

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('username', formData.username)
        .single();

      if (profileError || !profile) throw new Error('Username not found.');

      const { error } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password: formData.password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) throw new Error('Invalid username or password.');
        if (error.message.includes('Email not confirmed')) throw new Error('Please verify your email before logging in.');
        throw new Error('Login failed: ' + error.message);
      }

      setShowModal(false);
      setFormData({ username: '', email: '', phone: '', location: '', password: '' });
    } catch (err) {
      console.error('Login error:', err.message);
      setError(err.message || 'Login failed.');
      setIsMockMode(true);
    } finally {
      setLoading(prev => ({ ...prev, form: false }));
    }
  }, [formData, isOffline, isMockMode, useJsonServer]);

  const handleLogout = useCallback(async () => {
    if (isOffline || isMockMode || useJsonServer) {
      setError('Logout not supported in offline, mock, or JSON server mode.');
      setUser(null);
      setTasks([]);
      setUserTasks([]);
      setAcceptedTasks([]);
      return;
    }
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      localStorage.removeItem('cachedUser');
      localStorage.removeItem('cachedTasks');
      localStorage.removeItem('cachedUserTasks');
      localStorage.removeItem('cachedAcceptedTasks');
    } catch (err) {
      console.error('Logout error:', err.message);
      setError('Failed to log out: ' + (err.message || 'Unknown error.'));
      setIsMockMode(true);
    }
  }, [isOffline, isMockMode, useJsonServer]);

  const createTask = useCallback(async (taskData) => {
    if (isOffline || isMockMode) {
      setError('Cannot create tasks in offline or mock mode.');
      return null;
    }
    if (!user) {
      setShowModal(true);
      setFormType('signup');
      return null;
    }

    setLoading(prev => ({ ...prev, form: true }));
    setError(null);
    setSuccess(null);

    try {
      if (!taskData.title || !taskData.description || !taskData.location || !taskData.price || !taskData.category) {
        throw new Error('All task fields are required.');
      }
      const priceNum = parseFloat(taskData.price);
      if (isNaN(priceNum) || priceNum <= 0) throw new Error('Price must be a positive number.');

      let data;
      if (useJsonServer) {
        const response = await fetch('http://localhost:3001/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...taskData,
            id: Date.now().toString(),
            user_id: user.id,
            status: 'open',
            created_at: new Date().toISOString(),
            attachment: taskData.attachment,
          }),
        });
        data = await response.json();
      } else {
        const { data: supabaseData, error } = await supabase
          .from('tasks')
          .insert({
            ...taskData,
            user_id: user.id,
            status: 'open',
            attachment: taskData.attachment,
          })
          .select()
          .single();

        if (error) throw new Error('Task creation failed: ' + error.message);
        data = supabaseData;
      }

      setTasks(prev => [data, ...prev]);
      setUserTasks(prev => [data, ...prev]);
      cacheTasks([data, ...tasks], [data, ...userTasks], acceptedTasks);
      setSuccess('Task posted successfully!');
      await fetchAllTasks(user.id);
      return data;
    } catch (err) {
      console.error('Error creating task:', err.message);
      setError(err.message || 'Failed to create task.');
      setIsMockMode(true);
      return null;
    } finally {
      setLoading(prev => ({ ...prev, form: false }));
    }
  }, [user, isOffline, isMockMode, useJsonServer, fetchAllTasks, tasks, userTasks, acceptedTasks, cacheTasks]);

  const acceptTask = useCallback(async (taskId) => {
    if (isOffline || isMockMode) {
      setError('Cannot accept tasks in offline or mock mode.');
      return;
    }
    if (!user) {
      setShowModal(true);
      setFormType('signup');
      return;
    }

    try {
      let data;
      if (useJsonServer) {
        const response = await fetch(`http://localhost:3001/tasks/${taskId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'accepted',
            accepted_by: user.id,
          }),
        });
        data = await response.json();
      } else {
        const { data: supabaseData, error } = await supabase
          .from('tasks')
          .update({
            status: 'accepted',
            accepted_by: user.id
          })
          .eq('id', taskId)
          .select()
          .single();

        if (error) throw new Error('Task acceptance failed: ' + error.message);
        data = supabaseData;
      }

      setTasks(prev => prev.map(task => task.id === taskId ? data : task));
      setAcceptedTasks(prev => [data, ...prev]);
      cacheTasks(tasks.map(task => task.id === taskId ? data : task), userTasks, [data, ...acceptedTasks]);
      setSuccess('Task accepted successfully!');
      await fetchAllTasks(user.id);
    } catch (err) {
      console.error('Error accepting task:', err.message);
      setError(err.message || 'Failed to accept task.');
      setIsMockMode(true);
    }
  }, [user, isOffline, isMockMode, useJsonServer, fetchAllTasks, tasks, userTasks, acceptedTasks, cacheTasks]);

  const refreshTasks = useCallback(async () => {
    setError(null);
    setSuccess(null);
    await fetchAllTasks(user?.id || null);
    setSuccess('Tasks refreshed successfully!');
  }, [fetchAllTasks, user]);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setFormType(null);
    setError(null);
    setSuccess(null);
    setFormData({ username: '', email: '', phone: '', location: '', password: '' });
  }, []);

  const renderForm = useCallback(() => {
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
            { className: 'text-purple-600 cursor-pointer', onClick: () => setFormType('login') },
            'Log In'
          )
        ] : [
          "Don't have an account? ",
          React.createElement(
            'span',
            { className: 'text-purple-600 cursor-pointer', onClick: () => setFormType('signup') },
            'Sign Up'
          )
        ]
      )
    );
  }, [formType, error, success, formData, handleInputChange, handleSignUp, handleLogin, loading.form]);

  const getTaskCategory = useCallback((task) => {
    if (task.category === 'online') return 'online';
    if (task.category === 'offline') return 'offline';
    if (offlineTaskCategories.includes(task.title)) return 'offline';
    if (onlineTaskCategories.includes(task.title)) return 'online';
    return 'offline';
  }, [offlineTaskCategories, onlineTaskCategories]);

  const nearbyTasks = useMemo(() => 
    user ? tasks.filter(task => task.location.toLowerCase() === user.user_metadata?.location?.toLowerCase()) : tasks,
    [tasks, user]
  );

  const offlineTasks = useMemo(() => 
    tasks.filter(task => getTaskCategory(task) === 'offline'),
    [tasks, getTaskCategory]
  );

  const onlineTasks = useMemo(() => 
    tasks.filter(task => getTaskCategory(task) === 'online'),
    [tasks, getTaskCategory]
  );

  if (loading.app) {
    return React.createElement(
      'div',
      { className: 'flex items-center justify-center min-h-screen' },
      React.createElement('div', { className: 'animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500' }),
      React.createElement('p', { className: 'mt-4 text-gray-600' }, 'Loading ZipTask...')
    );
  }

  if (isOffline || useCachedData) {
    return React.createElement(
      'div',
      { className: 'relative min-h-screen flex flex-col items-center font-sans overflow-hidden text-black' },
      React.createElement(
        'div',
        {
          className: 'absolute inset-0 -z-10',
          style: {
            animation: 'moveBg 20s ease-in-out infinite alternate',
            background: 'radial-gradient(circle at 50% 40%, rgba(255, 124, 209, 0.8), rgba(142, 119, 255, 0.6), rgba(0, 0, 0, 0.9) 70%), radial-gradient(circle at 70% 60%, rgba(142, 119, 255, 0.75), rgba(0, 0, 0, 0.9) 100%)',
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
          { className: 'w-full max-w-full flex justify-between items-center p-4 bg-white shadow-md' },
          React.createElement(
            'h1',
            { className: 'text-4xl font-bold flex items-center bg-gradient-to-r from-yellow-400 to-pink-700 text-transparent bg-clip-text' },
            'ZipTask'
          ),
          React.createElement(
            'div',
            { className: 'flex items-center gap-3' },
            user ? [
              React.createElement(
                'div',
                {
                  className: 'relative flex items-center',
                  onMouseEnter: () => setShowProfileDropdown(true),
                  onMouseLeave: () => setShowProfileDropdown(false),
                  key: 'profile'
                },
                React.createElement(
                  'span',
                  { className: 'mr-2 text-sm hidden sm:inline cursor-pointer' },
                  React.createElement(FontAwesomeIcon, { icon: faUser, className: 'mr-1 text-purple-600' }),
                  ` ${user.user_metadata?.username || 'User'}`
                ),
                showProfileDropdown && React.createElement(
                  'div',
                  { className: 'absolute top-10 right-0 bg-white p-4 rounded-lg shadow-lg z-50 text-sm text-gray-700 min-w-max' },
                  React.createElement('p', { className: 'font-semibold' }, `Username: ${user.user_metadata?.username || 'N/A'}`),
                  React.createElement('p', null, `Email: ${user.user_metadata?.email || 'N/A'}`),
                  React.createElement('p', null, `Phone: ${user.user_metadata?.phone || 'N/A'}`),
                  React.createElement('p', null, `Location: ${user.user_metadata?.location || 'N/A'}`)
                )
              ),
              React.createElement(
                'button',
                {
                  onClick: () => {
                    setShowModal(true);
                    setFormType('create-task');
                  },
                  className: 'bg-purple-600 text-white px-4 py-2 rounded-xl shadow-md hover:bg-purple-700 transition flex items-center',
                  key: 'post-task'
                },
                React.createElement(FontAwesomeIcon, { icon: faTasks, className: 'mr-2' }),
                'Post a Task'
              ),
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
          { className: 'max-w-7xl mx-auto w-full px-4 py-8' },
          React.createElement(
            'section',
            { className: 'bg-white p-6 rounded-2xl shadow-lg mb-8 text-center' },
            React.createElement(FontAwesomeIcon, { icon: faExclamationTriangle, className: 'text-yellow-500 text-5xl mb-4' }),
            React.createElement('h2', { className: 'text-3xl font-bold mb-4' }, useCachedData ? 'Using Cached Data' : 'Offline Mode'),
            React.createElement('p', { className: 'text-gray-700 mb-4' }, 
              useCachedData 
                ? 'We couldn’t connect to the server. Displaying cached data from your last session.' 
                : 'We couldn’t connect to the server. You’re in offline mode.'
            ),
            React.createElement(
              'div',
              { className: 'flex justify-center gap-4' },
              React.createElement(
                'button',
                {
                  onClick: retryConnection,
                  className: 'bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition'
                },
                'Retry Connection'
              ),
              !useCachedData && React.createElement(
                'button',
                {
                  onClick: () => {
                    setUseCachedData(true);
                    const { cachedTasks, cachedUserTasks, cachedAcceptedTasks } = loadCachedTasks();
                    setTasks(cachedTasks.length > 0 ? cachedTasks : mockTasks);
                    setUserTasks(cachedUserTasks);
                    setAcceptedTasks(cachedAcceptedTasks);
                    const cachedUser = loadCachedUserProfile();
                    if (cachedUser) setUser(cachedUser);
                  },
                  className: 'bg-gray-200 text-black px-6 py-2 rounded-lg hover:bg-gray-300 transition'
                },
                'Use Cached Data'
              )
            )
          ),
          user && [
            React.createElement(
              'section',
              { className: 'bg-white p-6 rounded-2xl shadow-lg mb-8', key: 'profile' },
              React.createElement(
                'div',
                { className: 'flex items-center justify-center mb-4' },
                React.createElement(FontAwesomeIcon, { icon: faUser, className: 'text-4xl text-purple-600 mr-3' })
              ),
              React.createElement('h2', { className: 'text-3xl font-bold mb-2 text-center' }, `Welcome, ${user.user_metadata?.username || 'User'}!`),
              React.createElement('p', { className: 'text-gray-700 mb-2 text-center' }, `Email: ${user.user_metadata?.email || 'Not available'}`),
              React.createElement('p', { className: 'text-gray-700 mb-2 text-center' }, `Phone: ${user.user_metadata?.phone || 'Not available'}`),
              React.createElement('p', { className: 'text-gray-700 text-center' }, `Location: ${user.user_metadata?.location || 'Not specified'}`)
            ),
            React.createElement(
              'section',
              { className: 'mb-12', key: 'user-tasks' },
              React.createElement(
                'div',
                { className: 'flex justify-between items-center mb-6' },
                React.createElement('h2', { className: 'text-3xl font-bold text-center' }, 'Your Posted Tasks'),
                React.createElement(
                  'button',
                  {
                    onClick: refreshTasks,
                    className: 'bg-gray-200 text-black px-4 py-2 rounded-lg hover:bg-gray-300 transition flex items-center',
                    disabled: loading.tasks
                  },
                  React.createElement(FontAwesomeIcon, { icon: faSync, className: `mr-2 ${loading.tasks ? 'animate-spin' : ''}` }),
                  'Refresh'
                )
              ),
              userTasks.length > 0 ? React.createElement(
                'div',
                { className: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-slide-in' },
                userTasks.map((task, idx) => React.createElement(TaskCard, {
                  task,
                  idx,
                  acceptTask,
                  user,
                  cardGradients,
                  taskIcons,
                  faMapMarkerAlt,
                  key: task.id
                }))
              ) : React.createElement('div', { className: 'text-center py-10 text-gray-500' }, 'You haven’t posted any tasks yet.')
            ),
            React.createElement(
              'section',
              { className: 'mb-12', key: 'accepted-tasks' },
              React.createElement(
                'div',
                { className: 'flex justify-between items-center mb-6' },
                React.createElement('h2', { className: 'text-3xl font-bold text-center' }, 'Tasks You’ve Accepted'),
                React.createElement(
                  'button',
                  {
                    onClick: refreshTasks,
                    className: 'bg-gray-200 text-black px-4 py-2 rounded-lg hover:bg-gray-300 transition flex items-center',
                    disabled: loading.tasks
                  },
                  React.createElement(FontAwesomeIcon, { icon: faSync, className: `mr-2 ${loading.tasks ? 'animate-spin' : ''}` }),
                  'Refresh'
                )
              ),
              acceptedTasks.length > 0 ? React.createElement(
                'div',
                { className: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-slide-in' },
                acceptedTasks.map((task, idx) => React.createElement(TaskCard, {
                  task,
                  idx,
                  acceptTask,
                  user,
                  cardGradients,
                  taskIcons,
                  faMapMarkerAlt,
                  key: task.id
                }))
              ) : React.createElement('div', { className: 'text-center py-10 text-gray-500' }, 'You haven’t accepted any tasks yet.')
            )
          ],
          React.createElement(
            'section',
            { className: 'mb-12' },
            React.createElement(
              'div',
              { className: 'flex justify-between items-center mb-6' },
              React.createElement(
                'h2',
                { className: 'text-3xl font-bold text-center flex items-center' },
                React.createElement(FontAwesomeIcon, { icon: faMapMarkerAlt, className: 'mr-2' }),
                `Nearby Tasks ${useCachedData ? '(Cached)' : ''}`
              ),
              React.createElement(
                'button',
                {
                  onClick: refreshTasks,
                  className: 'bg-gray-200 text-black px-4 py-2 rounded-lg hover:bg-gray-300 transition flex items-center',
                  disabled: loading.tasks
                },
                React.createElement(FontAwesomeIcon, { icon: faSync, className: `mr-2 ${loading.tasks ? 'animate-spin' : ''}` }),
                'Refresh'
              )
            ),
            tasks.length > 0 ? React.createElement(
              'div',
              { className: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-slide-in' },
              tasks.map((task, idx) => React.createElement(TaskCard, {
                task,
                idx,
                acceptTask,
                user,
                cardGradients,
                taskIcons,
                faMapMarkerAlt,
                key: task.id
              }))
            ) : React.createElement('div', { className: 'text-center py-10 text-gray-500' }, 'No tasks available.')
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
          background: 'radial-gradient(circle at 50% 40%, rgba(255, 124, 209, 0.8), rgba(142, 119, 255, 0.6), rgba(0, 0, 0, 0.9) 70%), radial-gradient(circle at 70% 60%, rgba(142, 119, 255, 0.75), rgba(0, 0, 0, 0.9) 100%)',
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
        { className: 'w-full max-w-full flex justify-between items-center p-4 bg-white shadow-md' },
        React.createElement(
          'h1',
          { className: 'text-4xl font-bold flex items-center bg-gradient-to-r from-yellow-400 to-pink-700 text-transparent bg-clip-text' },
          'ZipTask'
        ),
        React.createElement(
          'div',
          { className: 'flex items-center gap-3' },
          user ? [
            React.createElement(
              'div',
              {
                className: 'relative flex items-center',
                onMouseEnter: () => setShowProfileDropdown(true),
                onMouseLeave: () => setShowProfileDropdown(false),
                key: 'profile'
              },
              React.createElement(
                'span',
                { className: 'mr-2 text-sm hidden sm:inline cursor-pointer' },
                React.createElement(FontAwesomeIcon, { icon: faUser, className: 'mr-1 text-purple-600' }),
                ` ${user.user_metadata?.username || 'User'}`
              ),
              showProfileDropdown && React.createElement(
                'div',
                { className: 'absolute top-10 right-0 bg-white p-4 rounded-lg shadow-lg z-50 text-sm text-gray-700 min-w-max' },
                React.createElement('p', { className: 'font-semibold' }, `Username: ${user.user_metadata?.username || 'N/A'}`),
                React.createElement('p', null, `Email: ${user.user_metadata?.email || 'N/A'}`),
                React.createElement('p', null, `Phone: ${user.user_metadata?.phone || 'N/A'}`),
                React.createElement('p', null, `Location: ${user.user_metadata?.location || 'N/A'}`)
              )
            ),
            React.createElement(
              'button',
              {
                onClick: () => {
                  setShowModal(true);
                  setFormType('create-task');
                },
                className: 'bg-purple-600 text-white px-4 py-2 rounded-xl shadow-md hover:bg-purple-700 transition flex items-center',
                key: 'post-task'
              },
              React.createElement(FontAwesomeIcon, { icon: faTasks, className: 'mr-2' }),
              'Post a Task'
            ),
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
        { className: 'max-w-7xl mx-auto w-full px-4 py-8' },
        user ? [
          React.createElement(
            'section',
            { className: 'bg-white p-6 rounded-2xl shadow-lg mb-8', key: 'profile' },
            React.createElement(
              'div',
              { className: 'flex items-center justify-center mb-4' },
              React.createElement(FontAwesomeIcon, { icon: faUser, className: 'text-4xl text-purple-600 mr-3' })
            ),
            React.createElement('h2', { className: 'text-3xl font-bold mb-2 text-center' }, `Welcome, ${user.user_metadata?.username || 'User'}!`),
            React.createElement('p', { className: 'text-gray-700 mb-2 text-center' }, `Email: ${user.user_metadata?.email || 'Not available'}`),
            React.createElement('p', { className: 'text-gray-700 mb-2 text-center' }, `Phone: ${user.user_metadata?.phone || 'Not available'}`),
            React.createElement('p', { className: 'text-gray-700 text-center' }, `Location: ${user.user_metadata?.location || 'Not specified'}`)
          ),
          React.createElement(
            'section',
            { className: 'mb-12', key: 'user-tasks' },
            React.createElement(
              'div',
              { className: 'flex justify-between items-center mb-6' },
              React.createElement('h2', { className: 'text-3xl font-bold text-center' }, 'Your Posted Tasks'),
              React.createElement(
                'button',
                {
                  onClick: refreshTasks,
                  className: 'bg-gray-200 text-black px-4 py-2 rounded-lg hover:bg-gray-300 transition flex items-center',
                  disabled: loading.tasks
                },
                React.createElement(FontAwesomeIcon, { icon: faSync, className: `mr-2 ${loading.tasks ? 'animate-spin' : ''}` }),
                'Refresh'
              )
            ),
            userTasks.length > 0 ? React.createElement(
              'div',
              { className: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-slide-in' },
              userTasks.map((task, idx) => React.createElement(TaskCard, {
                task,
                idx,
                acceptTask,
                user,
                cardGradients,
                taskIcons,
                faMapMarkerAlt,
                key: task.id
              }))
            ) : React.createElement('div', { className: 'text-center py-10 text-gray-500' }, 'You haven’t posted any tasks yet.')
          ),
          React.createElement(
            'section',
            { className: 'mb-12', key: 'accepted-tasks' },
            React.createElement(
              'div',
              { className: 'flex justify-between items-center mb-6' },
              React.createElement('h2', { className: 'text-3xl font-bold text-center' }, 'Tasks You’ve Accepted'),
              React.createElement(
                'button',
                {
                  onClick: refreshTasks,
                  className: 'bg-gray-200 text-black px-4 py-2 rounded-lg hover:bg-gray-300 transition flex items-center',
                  disabled: loading.tasks
                },
                React.createElement(FontAwesomeIcon, { icon: faSync, className: `mr-2 ${loading.tasks ? 'animate-spin' : ''}` }),
                'Refresh'
              )
            ),
            acceptedTasks.length > 0 ? React.createElement(
              'div',
              { className: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-slide-in' },
              acceptedTasks.map((task, idx) => React.createElement(TaskCard, {
                task,
                idx,
                acceptTask,
                user,
                cardGradients,
                taskIcons,
                faMapMarkerAlt,
                key: task.id
              }))
            ) : React.createElement('div', { className: 'text-center py-10 text-gray-500' }, 'You haven’t accepted any tasks yet.')
          )
        ] : [
          React.createElement(
            'section',
            { className: 'text-center py-12 rounded-2xl mb-8', key: 'hero' },
            React.createElement('h2', { className: 'text-4xl md:text-5xl font-bold leading-tight text-black mb-4' }, 'ZipTask — Your Hyperlocal Task Marketplace'),
            React.createElement('p', { className: 'mt-4 text-gray-700 max-w-xl mx-auto' }, 'Connect with nearby people to get things done quickly — whether online or offline.'),
            React.createElement(
              'div',
              { className: 'mt-6 flex justify-center space-x-4' },
              React.createElement(
                'button',
                {
                  onClick: () => {
                    if (!user) {
                      setShowModal(true);
                      setFormType('signup');
                    } else {
                      setShowModal(true);
                      setFormType('create-task');
                    }
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
          )
        ],
        React.createElement(
          'section',
          { className: 'mb-12' },
          React.createElement(
            'div',
            { className: 'flex justify-between items-center mb-6' },
            React.createElement(
              'h2',
              { className: 'text-3xl font-bold text-center flex items-center' },
              React.createElement(FontAwesomeIcon, { icon: faMapMarkerAlt, className: 'mr-2' }),
              'Nearby Tasks'
            ),
            React.createElement(
              'button',
              {
                onClick: refreshTasks,
                className: 'bg-gray-200 text-black px-4 py-2 rounded-lg hover:bg-gray-300 transition flex items-center',
                disabled: loading.tasks
              },
              React.createElement(FontAwesomeIcon, { icon: faSync, className: `mr-2 ${loading.tasks ? 'animate-spin' : ''}` }),
              'Refresh'
            )
          ),
          loading.tasks ? React.createElement(
            'div',
            { className: 'flex justify-center items-center h-40' },
            React.createElement('div', { className: 'animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500' })
          ) : nearbyTasks.length > 0 ? React.createElement(
            'div',
            { className: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-slide-in' },
            nearbyTasks.map((task, idx) => React.createElement(TaskCard, {
              task,
              idx,
              acceptTask,
              user,
              cardGradients,
              taskIcons,
              faMapMarkerAlt,
              key: task.id
            }))
          ) : React.createElement('div', { className: 'text-center py-10 text-gray-500' }, 'No nearby tasks available at the moment.')
        ),
        React.createElement(
          'section',
          { className: 'mb-12' },
          React.createElement(
            'div',
            { className: 'flex justify-between items-center mb-6' },
            React.createElement(
              'h2',
              { className: 'text-3xl font-bold text-center flex items-center' },
              React.createElement(FontAwesomeIcon, { icon: faHome, className: 'mr-2' }),
              'Offline Tasks'
            ),
            React.createElement(
              'button',
              {
                onClick: refreshTasks,
                className: 'bg-gray-200 text-black px-4 py-2 rounded-lg hover:bg-gray-300 transition flex items-center',
                disabled: loading.tasks
              },
              React.createElement(FontAwesomeIcon, { icon: faSync, className: `mr-2 ${loading.tasks ? 'animate-spin' : ''}` }),
              'Refresh'
            )
          ),
          loading.tasks ? React.createElement(
            'div',
            { className: 'flex justify-center items-center h-40' },
            React.createElement('div', { className: 'animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500' })
          ) : offlineTasks.length > 0 ? React.createElement(
            'div',
            { className: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-slide-in' },
            offlineTasks.map((task, idx) => React.createElement(TaskCard, {
              task,
              idx,
              acceptTask,
              user,
              cardGradients,
              taskIcons,
              faMapMarkerAlt,
              key: task.id
            }))
          ) : React.createElement('div', { className: 'text-center py-10 text-gray-500' }, 'No offline tasks available at the moment.')
        ),
        React.createElement(
          'section',
          { className: 'mb-12' },
          React.createElement(
            'div',
            { className: 'flex justify-between items-center mb-6' },
            React.createElement(
              'h2',
              { className: 'text-3xl font-bold text-center flex items-center' },
              React.createElement(FontAwesomeIcon, { icon: faGlobe, className: 'mr-2' }),
              'Online Tasks'
            ),
            React.createElement(
              'button',
              {
                onClick: refreshTasks,
                className: 'bg-gray-200 text-black px-4 py-2 rounded-lg hover:bg-gray-300 transition flex items-center',
                disabled: loading.tasks
              },
              React.createElement(FontAwesomeIcon, { icon: faSync, className: `mr-2 ${loading.tasks ? 'animate-spin' : ''}` }),
              'Refresh'
            )
          ),
          loading.tasks ? React.createElement(
            'div',
            { className: 'flex justify-center items-center h-40' },
            React.createElement('div', { className: 'animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500' })
          ) : onlineTasks.length > 0 ? React.createElement(
            'div',
            { className: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-slide-in' },
            onlineTasks.map((task, idx) => React.createElement(TaskCard, {
              task,
              idx,
              acceptTask,
              user,
              cardGradients,
              taskIcons,
              faMapMarkerAlt,
              key: task.id
            }))
          ) : React.createElement('div', { className: 'text-center py-10 text-gray-500' }, 'No online tasks available at the moment.')
        ),
        React.createElement(
          'section',
          { className: 'mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center' },
          React.createElement(
            'div',
            { className: 'bg-white p-6 rounded-2xl shadow-lg' },
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
            { className: 'bg-white p-6 rounded-2xl shadow-lg' },
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
            { className: 'bg-white p-6 rounded-2xl shadow-lg' },
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
          { className: 'mt-12 grid grid-cols-1 md:grid-cols-4 gap-6' },
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
                className: `bg-gradient-to-br ${cardGradients[idx % cardGradients.length]} text-white rounded-2xl p-6 shadow-lg text-center transition-all`
              },
              React.createElement('div', { className: 'text-3xl mb-2' }, React.createElement(FontAwesomeIcon, { icon: feature.icon })),
              React.createElement('h4', { className: 'text-lg font-semibold' }, feature.title),
              React.createElement('p', { className: 'text-sm' }, feature.desc)
            )
          )
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
        formType === 'create-task' ? [
          React.createElement('h2', { className: 'text-2xl font-bold mb-4', key: 'title' }, 'Create a New Task'),
          React.createElement(TaskCreationForm, {
            createTask,
            setShowModal,
            loading,
            error,
            success,
            key: 'task-form'
          })
        ] : [
          React.createElement('h2', { className: 'text-2xl font-bold mb-4', key: 'title' }, formType === 'signup' ? 'Sign Up' : 'Log In'),
          renderForm()
        ]
      )
    )
  );
}

module.exports = App;