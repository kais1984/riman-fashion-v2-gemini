import { Resend } from 'resend';

function getResendClient(): Resend | null {
  const apiKey = import.meta.env.RESEND_API_KEY;
  if (!apiKey) {
    console.info('[Riman] Email not configured — set RESEND_API_KEY');
    return null;
  }
  return new Resend(apiKey);
}

interface OrderEmailData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    size?: string;
    intent?: 'sale' | 'rent';
    rentalStartDate?: string;
    rentalEndDate?: string;
  }>;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  createdAt: string;
}

export async function sendOrderConfirmationEmail(data: OrderEmailData): Promise<{ success: boolean; error?: string }> {
  try {
    const itemsHtml = data.items.map(item => `
      <tr style="border-bottom: 1px solid #E8E3D9;">
        <td style="padding: 12px 8px;">${item.name}${item.size ? ` (${item.size})` : ''}</td>
        <td style="padding: 12px 8px; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px 8px; text-align: right;">AED ${item.price.toLocaleString()}</td>
      </tr>
    `).join('');

    const rentalInfo = data.items.some(i => i.intent === 'rent') ? `
      <p style="margin: 16px 0; padding: 12px; background: #F6F0E6; border: 1px solid #E8E3D9; font-size: 14px; color: #44403C;">
        <strong>Rental order:</strong> Your rental period will be confirmed via email. Please ensure items are returned by the agreed date.
      </p>
    ` : '';

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background: #EFEAE2;">
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #292524; max-width: 600px; margin: 0 auto; padding: 24px;">
          <div style="text-align: center; margin-bottom: 32px; padding-top: 16px;">
            <h1 style="font-family: Georgia, 'Times New Roman', serif; color: #161513; margin: 0 0 8px; font-size: 26px; letter-spacing: 0.1em; text-transform: uppercase;">Atelier Riman</h1>
            <p style="color: #78716C; font-size: 13px; margin: 0; letter-spacing: 0.2em; text-transform: uppercase;">Sharjah</p>
            <div style="width: 48px; height: 2px; background: #A2492B; margin: 16px auto 0;"></div>
          </div>

          <div style="background: #F6F0E6; border: 1px solid #E8E3D9; padding: 24px; margin-bottom: 24px;">
            <h2 style="margin: 0 0 16px; font-size: 20px; color: #161513; font-family: Georgia, 'Times New Roman', serif;">Order Confirmation</h2>
            <p style="margin: 0 0 8px;">Hi <strong>${data.customerName}</strong>,</p>
            <p style="margin: 0 0 16px;">Thank you for your order! We're delighted to confirm your purchase.</p>
            
            <p style="margin: 0 0 8px;"><strong>Order ID:</strong> ${data.orderId}</p>
            <p style="margin: 0 0 16px;"><strong>Date:</strong> ${new Date(data.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            
            ${rentalInfo}
          </div>

          <div style="margin-bottom: 24px;">
            <h3 style="font-size: 16px; color: #161513; margin: 0 0 12px; border-bottom: 2px solid #A2492B; padding-bottom: 8px; font-family: Georgia, 'Times New Roman', serif;">Order Details</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <thead>
                <tr style="border-bottom: 1px solid #E8E3D9;">
                  <th style="text-align: left; padding: 12px 8px; font-weight: 600;">Item</th>
                  <th style="text-align: center; padding: 12px 8px; font-weight: 600;">Qty</th>
                  <th style="text-align: right; padding: 12px 8px; font-weight: 600;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            
            <div style="margin-top: 16px; text-align: right;">
              <p style="margin: 4px 0;"><strong>Subtotal:</strong> AED ${data.subtotal.toLocaleString()}</p>
              <p style="margin: 4px 0;"><strong>Shipping:</strong> AED ${data.shipping.toLocaleString()}</p>
              <p style="margin: 4px 0;"><strong>Tax:</strong> AED ${data.tax.toLocaleString()}</p>
              <p style="margin: 8px 0 0; font-size: 18px; color: #A2492B;"><strong>Total: AED ${data.total.toLocaleString()}</strong></p>
            </div>
          </div>

          <div style="background: #F6F0E6; border: 1px solid #E8E3D9; padding: 24px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 12px; font-size: 16px; color: #161513; font-family: Georgia, 'Times New Roman', serif;">Shipping Address</h3>
            <p style="margin: 4px 0;">${data.shippingAddress.name}</p>
            <p style="margin: 4px 0;">${data.shippingAddress.line1}${data.shippingAddress.line2 ? ', ' + data.shippingAddress.line2 : ''}</p>
            <p style="margin: 4px 0;">${data.shippingAddress.city}${data.shippingAddress.state ? ', ' + data.shippingAddress.state : ''} ${data.shippingAddress.postalCode}</p>
            <p style="margin: 4px 0;">${data.shippingAddress.country}</p>
          </div>

          <div style="background: #F6F0E6; border: 1px solid #E8E3D9; padding: 24px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 12px; font-size: 16px; color: #161513; font-family: Georgia, 'Times New Roman', serif;">Payment Method</h3>
            <p style="margin: 0;">${data.paymentMethod}</p>
          </div>

          <hr style="border: none; border-top: 1px solid #E8E3D9; margin: 32px 0;">
          <p style="font-size: 12px; color: #78716C; text-align: center; margin: 0;">
            Atelier Riman · Al Zahra St, Sharjah, UAE · hello@rimanfashion.com
          </p>
          </div>
        </body>
      </html>
    `;

    const resend = getResendClient();
    if (!resend) return { success: false, error: 'not-configured' };

    const { data: _result, error } = await resend.emails.send({
      from: import.meta.env.RESEND_FROM_EMAIL || 'Riman Fashion <orders@rimanfashion.com>',
      to: data.customerEmail,
      subject: `Order Confirmation — ${data.orderId}`,
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    console.error('sendOrderConfirmationEmail error:', err);
    return { success: false, error: String(err) };
  }
}

export async function sendAdminOrderAlert(data: OrderEmailData): Promise<{ success: boolean; error?: string }> {
  try {
    const adminEmail = import.meta.env.RESEND_ADMIN_EMAIL || 'admin@rimanfashion.com';
    
    const html = `
      <h2>New Order Received</h2>
      <p><strong>Order ID:</strong> ${data.orderId}</p>
      <p><strong>Customer:</strong> ${data.customerName} (${data.customerEmail})</p>
      <p><strong>Total:</strong> AED ${data.total.toLocaleString()}</p>
      <p><strong>Items:</strong> ${data.items.length} item(s)</p>
      <p><strong>Payment:</strong> ${data.paymentMethod}</p>
      <p><a href="https://riman-fashion-v2.netlify.app/admin/orders/${data.orderId}">View in Admin</a></p>
    `;

    const resend = getResendClient();
    if (!resend) return { success: false, error: 'not-configured' };

    const { error } = await resend.emails.send({
      from: import.meta.env.RESEND_FROM_EMAIL || 'Riman Fashion <orders@rimanfashion.com>',
      to: adminEmail,
      subject: `🛍️ New Order — ${data.orderId}`,
      html,
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

export async function sendRentalReminderEmail(
  customerEmail: string,
  customerName: string,
  orderId: string,
  returnDate: string,
  items: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const html = `
      <h2>Rental Return Reminder</h2>
      <p>Hi ${customerName},</p>
      <p>This is a friendly reminder that your rental (Order ${orderId}) is due for return by <strong>${new Date(returnDate).toLocaleDateString()}</strong>.</p>
      <p>Items to return:</p>
      <ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>
      <p>Please ensure items are returned in their original condition.</p>
      <p>Questions? Reply to this email or contact us at hello@rimanfashion.com</p>
    `;

    const resend = getResendClient();
    if (!resend) return { success: false, error: 'not-configured' };

    const { error } = await resend.emails.send({
      from: import.meta.env.RESEND_FROM_EMAIL || 'Riman Fashion <orders@rimanfashion.com>',
      to: customerEmail,
      subject: `Rental Return Reminder — ${orderId}`,
      html,
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

export async function sendAppointmentConfirmationEmail(data: {
  name: string;
  email: string;
  date: string;
  time: string;
  gowns: string[];
}): Promise<{ success: boolean; error?: string }> {
  try {
    const resend = getResendClient();
    if (!resend) return { success: false, error: 'not-configured' };

    const html = `
      <!DOCTYPE html>
      <html><body style="margin:0;padding:0;background:#EFEAE2;">
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;line-height:1.6;color:#292524;max-width:600px;margin:0 auto;padding:24px;">
        <div style="text-align:center;margin-bottom:32px;padding-top:16px;">
          <h1 style="font-family:Georgia,'Times New Roman',serif;color:#161513;margin:0 0 8px;font-size:26px;letter-spacing:0.1em;text-transform:uppercase;">Atelier Riman</h1>
          <p style="color:#78716C;font-size:13px;margin:0;letter-spacing:0.2em;text-transform:uppercase;">Sharjah</p>
          <div style="width:48px;height:2px;background:#A2492B;margin:16px auto 0;"></div>
        </div>
        <div style="background:#F6F0E6;border:1px solid #E8E3D9;padding:24px;">
          <h2 style="margin:0 0 16px;font-size:20px;font-family:Georgia,'Times New Roman',serif;color:#161513;">Your Private Viewing</h2>
          <p>Dear <strong>${data.name}</strong>,</p>
          <p>Your viewing request has been received for <strong>${new Date(data.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</strong> at <strong>${data.time}</strong>.</p>
          ${data.gowns.length ? `<p>Pieces prepared for you:<br/><em>${data.gowns.join('<br/>')}</em></p>` : ''}
          <p style="margin-bottom:0;">Al Zahra St, Sharjah, UAE. To reschedule, simply reply to this email.</p>
        </div>
        <p style="font-size:12px;color:#78716C;text-align:center;margin-top:32px;">Atelier Riman · hello@rimanfashion.com</p>
        </div>
      </body></html>`;

    const { error } = await resend.emails.send({
      from: import.meta.env.RESEND_FROM_EMAIL || 'Riman Fashion <orders@rimanfashion.com>',
      to: data.email,
      subject: `Private Viewing Request — ${data.date}`,
      html,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    console.error('sendAppointmentConfirmationEmail error:', err);
    return { success: false, error: String(err) };
  }
}

export async function sendAppointmentAdminAlert(data: {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  gowns: string[];
}): Promise<{ success: boolean; error?: string }> {
  try {
    const resend = getResendClient();
    if (!resend) return { success: false, error: 'not-configured' };

    const adminEmail = import.meta.env.RESEND_ADMIN_EMAIL || 'admin@rimanfashion.com';
    const html = `
      <h2>New Viewing Request</h2>
      <p><strong>${data.name}</strong> · ${data.phone} · ${data.email}</p>
      <p><strong>Requested:</strong> ${data.date} at ${data.time}</p>
      ${data.gowns.length ? `<p><strong>Gowns:</strong> ${data.gowns.join(', ')}</p>` : ''}
      <p><a href="https://riman-fashion-v2.netlify.app/admin/appointments">Open Admin Calendar</a></p>`;

    const { error } = await resend.emails.send({
      from: import.meta.env.RESEND_FROM_EMAIL || 'Riman Fashion <orders@rimanfashion.com>',
      to: adminEmail,
      subject: `📅 Viewing Request — ${data.name}`,
      html,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    console.error('sendAppointmentAdminAlert error:', err);
    return { success: false, error: String(err) };
  }
}