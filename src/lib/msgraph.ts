type MicrosoftGraphTokenResponse = {
  access_token: string;
  expires_in: number;
  token_type: string;
};

type SendMailParams = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export async function getMicrosoftGraphAccessToken() {
  const tenantId = getRequiredEnv("MSGRAPH_TENANT_ID");
  const clientId = getRequiredEnv("MSGRAPH_CLIENT_ID");
  const clientSecret = getRequiredEnv("MSGRAPH_CLIENT_SECRET");

  const response = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      scope: "https://graph.microsoft.com/.default",
      grant_type: "client_credentials",
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Microsoft Graph token request failed: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as MicrosoftGraphTokenResponse;

  if (!data.access_token) {
    throw new Error("Microsoft Graph token response did not include an access token.");
  }

  return data.access_token;
}

export async function sendMicrosoftGraphMail({ to, subject, html, text }: SendMailParams) {
  const sendAs = getRequiredEnv("MSGRAPH_SEND_AS");
  const accessToken = await getMicrosoftGraphAccessToken();

  const response = await fetch(`https://graph.microsoft.com/v1.0/users/${encodeURIComponent(sendAs)}/sendMail`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: {
        subject,
        body: {
          contentType: "HTML",
          content: html,
        },
        toRecipients: [
          {
            emailAddress: {
              address: to,
            },
          },
        ],
        replyTo: [
          {
            emailAddress: {
              address: sendAs,
            },
          },
        ],
        ...(text
          ? {
              internetMessageHeaders: [
                {
                  name: "X-Alt-Body-Text",
                  value: text,
                },
              ],
            }
          : {}),
      },
      saveToSentItems: true,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Microsoft Graph sendMail failed: ${response.status} ${errorText}`);
  }
}
