import { Config } from '@/constants/config';

export async function getAIExplanation(
  question: string,
  correctOption: string,
  correctAnswer: string,
  wrongAnswer: string,
  subject: string,
  topic: string
): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_OPENROUTER_KEY;

  if (!apiKey) {
    // Return a mock explanation when API key is not configured
    return getMockExplanation(correctAnswer, wrongAnswer);
  }

  const prompt = `Сен ${subject} пәнінен тәжірибелі репетиторсың.
Тақырып: ${topic}
Сұрақ: ${question}
Оқушы таңдаған жауап: ${wrongAnswer} (ҚАТЕ)
Дұрыс жауап: ${correctAnswer}

Қазақша, қарапайым тілде, 3-4 сөйлеммен түсіндір:
1. Неге ${correctAnswer} дұрыс
2. Бір нақты мысал кел
3. Есте сақтауға көмектесетін кеңес

16 жасқа арналған, достық тонда жаз. Emoji қолдана аласың.`;

  try {
    const response = await fetch(Config.OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: Config.AI_MODEL,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: Config.AI_MAX_TOKENS,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('AI explanation error:', error);
    return getMockExplanation(correctAnswer, wrongAnswer);
  }
}

function getMockExplanation(correctAnswer: string, wrongAnswer: string): string {
  return `📚 Дұрыс жауап: ${correctAnswer}

Сен "${wrongAnswer}" деп таңдадың, бірақ бұл дұрыс емес.

✅ ${correctAnswer} — дұрыс жауап, өйткені бұл тақырыптың негізгі ережесіне сай келеді.

💡 Кеңес: Осы тақырыпты қайталап, негізгі формулалар мен ережелерді есте сақтауға тырыс!`;
}
