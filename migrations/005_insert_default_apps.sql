-- Insert default apps
INSERT INTO apps (slug, name, description, icon_url, launch_url, requires_consent, is_active)
VALUES
  (
    'swiftcues',
    'SwiftCues',
    'IT Support Ticketing Platform',
    '🎫',
    'https://swiftcues.app',
    false,
    true
  ),
  (
    'ventra',
    'Ventra',
    'School Visitor Management',
    '🏫',
    'https://ventra.app',
    true,
    true
  ),
  (
    'leave-system',
    'Leave Request System',
    'Employee Leave Management',
    '📋',
    'https://leave.app',
    false,
    true
  )
ON CONFLICT (slug) DO NOTHING;
