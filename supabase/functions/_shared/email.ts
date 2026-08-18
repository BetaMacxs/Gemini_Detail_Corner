
export async function sendBrevoEmail({ to, subject, htmlContent }: { to: { email: string, name?: string }[], subject: string, htmlContent: string }) {
  const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY') || Deno.env.get('VITE_BREVO_API_KEY');
  const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || Deno.env.get('VITE_FROM_EMAIL') || 'andrews.ashley@outlook.com';
  const FROM_NAME = Deno.env.get('FROM_NAME') || Deno.env.get('VITE_FROM_NAME') || 'Detail Corner';

  if (!BREVO_API_KEY) {
    console.error('BREVO_API_KEY is not set');
    return { error: 'Email provider not configured (Missing BREVO_API_KEY)' };
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: FROM_NAME, email: FROM_EMAIL },
        to,
        subject,
        htmlContent
      })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Brevo API error:', data);
      return { error: data.message || 'Failed to send email' };
    }

    return { data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { error: error.message };
  }
}
