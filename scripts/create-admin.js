const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function createAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  console.log("Creating admin user in Auth...");
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: 'admin@computercenter.com',
    password: 'AdminPassword123!',
    email_confirm: true
  });

  if (authError) {
    console.error("Auth creation error:", authError.message);
    if (!authError.message.includes("already registered")) {
      return;
    }
  }

  const userId = authData?.user?.id;
  if (!userId) {
    console.log("User might already exist. Trying to fetch...");
    // We can't fetch by email easily without listUsers, let's assume it failed if no ID
  } else {
    console.log("Auth user created successfully. ID:", userId);
    
    // Check if the user already exists in the public.users table
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'admin@computercenter.com')
      .single();

    if (existingUser) {
      console.log("Updating existing users table entry with auth_id...");
      await supabase
        .from('users')
        .update({ auth_id: userId })
        .eq('id', existingUser.id);
      console.log("Admin setup complete!");
    } else {
      console.log("Inserting into users table...");
      await supabase
        .from('users')
        .insert({
          full_name: 'Center Admin',
          email: 'admin@computercenter.com',
          phone: '9876543210',
          role: 'admin',
          status: 'active',
          auth_id: userId
        });
      console.log("Admin setup complete!");
    }
  }
}

createAdmin();
