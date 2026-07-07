export function getDeviceFingerprint() {
  const parts = [
    navigator.userAgent || '',
    navigator.language || '',
    screen.width,
    screen.height,
    screen.colorDepth,
    navigator.hardwareConcurrency || '',
  ];
  const raw = parts.join('|||');
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) - hash) + raw.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(36);
}

export async function recordSession(clientId) {
  const deviceHash = getDeviceFingerprint();
  const { supabase } = await import('./supabase');

  // Check existing sessions for this client
  const { data: existing } = await supabase
    .from('sessions')
    .select('device_hash, id')
    .eq('client_id', clientId)
    .eq('is_blocked', false);

  const matches = existing?.filter(s => s.device_hash === deviceHash) || [];

  if (matches.length === 0 && existing?.length > 0) {
    // New device detected — possible sharing
    const otherDevice = existing[0]?.device_hash || 'unknown';

    // Create alert
    await supabase.from('sharing_alerts').insert({
      client_id: clientId,
      device_1: otherDevice,
      device_2: deviceHash,
    });

    // Create new session anyway (don't block — let admin decide)
  }

  // Upsert session
  const { data: session } = await supabase
    .from('sessions')
    .upsert({
      client_id: clientId,
      device_hash: deviceHash,
      user_agent: navigator.userAgent,
      last_active: new Date().toISOString(),
    }, { onConflict: 'client_id,device_hash', ignoreDuplicates: false })
    .select('id')
    .single();

  return session?.id;
}
