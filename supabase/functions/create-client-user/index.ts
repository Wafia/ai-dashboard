import { createClient } from 'jsr:@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, serviceRoleKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { action, email, password, user_id } = await req.json();

    switch (action) {
      case 'create': {
        if (!email || !password) throw new Error('Email and password are required');

        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email, password, email_confirm: true,
          user_metadata: { role: 'client' },
        });
        if (authError) throw new Error(authError.message);

        const { error: clientError } = await supabase
          .from('clients').insert({ email, auth_user_id: authData.user.id, is_active: true });
        if (clientError) {
          await supabase.auth.admin.deleteUser(authData.user.id);
          throw new Error(clientError.message);
        }

        return new Response(JSON.stringify({ id: authData.user.id, email, password }), {
          status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'delete': {
        if (!email) throw new Error('Email is required');

        // Find auth user by email
        let targetUserId = user_id;
        if (!targetUserId) {
          const { data: users } = await supabase.auth.admin.listUsers();
          const found = users?.users?.find(u => u.email === email);
          if (found) targetUserId = found.id;
        }

        if (targetUserId) {
          await supabase.auth.admin.deleteUser(targetUserId);
        }
        await supabase.from('clients').delete().eq('email', email);

        return new Response(JSON.stringify({ success: true }), {
          status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'update-password': {
        if (!user_id || !password) throw new Error('user_id and password are required');

        const { error } = await supabase.auth.admin.updateUserById(user_id, { password });
        if (error) throw new Error(error.message);

        return new Response(JSON.stringify({ success: true }), {
          status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
