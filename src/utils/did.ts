// D-ID API integration through proxy server
const PROXY_URL = 'http://localhost:3000/api';

interface TalkResponse {
  id: string;
  url?: string;
  status?: 'created' | 'started' | 'completed' | 'error';
}

export const createTalkingAvatar = async (text: string): Promise<string> => {
  try {
    // Create talk request through proxy
    const createResponse = await fetch(`${PROXY_URL}/talks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        script: {
          type: 'text',
          input: text,
        }
      }),
    });

    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      console.error('D-ID API Error:', errorData);
      throw new Error(`Failed to create talking avatar: ${errorData.message || createResponse.statusText}`);
    }

    const talkData: TalkResponse = await createResponse.json();

    // Poll for video status
    let status = 'created';
    let videoUrl = '';
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds timeout

    while (status !== 'completed' && status !== 'error' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
      
      const statusResponse = await fetch(`${PROXY_URL}/talks/${talkData.id}`);

      if (!statusResponse.ok) {
        const errorData = await statusResponse.json();
        console.error('D-ID Status API Error:', errorData);
        throw new Error(`Failed to get talk status: ${errorData.message || statusResponse.statusText}`);
      }

      const statusData: TalkResponse = await statusResponse.json();
      status = statusData.status || 'error';
      videoUrl = statusData.url || '';

      if (status === 'error') {
        throw new Error('D-ID processing failed');
      }
    }

    if (attempts >= maxAttempts) {
      throw new Error('Timeout waiting for D-ID response');
    }

    if (!videoUrl) {
      throw new Error('No video URL received from D-ID');
    }

    return videoUrl;
  } catch (error) {
    console.error('Error creating talking avatar:', error);
    throw error;
  }
};
