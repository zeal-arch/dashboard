
export const dynamic = 'force-dynamic';

const REALTIME_ITEMS = [
  {
    id: "rt-news-1",
    type: "news",
    category: "technology",
    source: "TechCrunch",
    title: "Quantum Computing Milestone Reached by Researchers",
    description: "Scientists have demonstrated quantum supremacy with a new 256-qubit quantum processor operating at room temperature.",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80",
    url: "https://techcrunch.mock/quantum",
    publishedAt: new Date().toISOString(),
  },
  {
    id: "rt-social-1",
    type: "social",
    category: "gaming",
    source: "reddit/r/gaming",
    title: "This new graphics engine looks hyper-realistic! 🤯",
    description: "Look at the lighting and physics simulation on this prototype demo. Unreal Engine 6 preview?",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80",
    url: "https://reddit.mock/gaming-rt",
    publishedAt: new Date().toISOString(),
  },
  {
    id: "rt-news-2",
    type: "news",
    category: "food",
    source: "Food Insider",
    title: "The Rise of Plant-Based Artisanal Cheeses",
    description: "New fermentation techniques allow cheesemakers to replicate dairy cheese structures with pure plant components.",
    image: "https://images.unsplash.com/photo-1486427944299-d1955d23e317?auto=format&fit=crop&w=600&q=80",
    url: "https://food.mock/cheese",
    publishedAt: new Date().toISOString(),
  },
];

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      let index = 0;

      // Keep connection alive by sending a data item every 15 seconds.
      const interval = setInterval(() => {
        const item = REALTIME_ITEMS[index % REALTIME_ITEMS.length];
        const uniqueItem = {
          ...item,
          id: `${item.id}-${Date.now()}`,
          publishedAt: new Date().toISOString(),
        };

        const data = `data: ${JSON.stringify(uniqueItem)}\n\n`;
        try {
          controller.enqueue(encoder.encode(data));
        } catch {
          clearInterval(interval);
        }
        index++;
      }, 15000);

      // Send initial connect success event
      controller.enqueue(encoder.encode("data: {\"connected\": true}\n\n"));

      // Clean up when stream closes
      // ReadableStream doesn't support returning a function in standard types,
      // but in Next.js response streams we can clear intervals on controller errors
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
