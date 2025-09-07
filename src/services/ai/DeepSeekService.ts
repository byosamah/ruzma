interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface BusinessInsight {
  category: 'revenue' | 'efficiency' | 'clients' | 'growth' | 'risks';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  recommendation: string;
  impact: string;
  confidence: number;
}

interface AnalyticsData {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalRevenue: number;
  monthlyRevenue: number;
  averageProjectValue: number;
  clientCount: number;
  repeatClientRate: number;
  onTimeDeliveryRate: number;
  successRate: number;
  averageProjectDuration: number;
  paymentCollectionSpeed: number;
  projectTypes: Array<{ label: string; value: number }>;
  revenueGrowth: number;
  clientSatisfaction: number;
}

export class DeepSeekService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = 'sk-d234f5db13f44208af8d6d8b73b293c1';
    this.baseUrl = 'https://api.deepseek.com/v1/chat/completions';
  }

  async generateBusinessInsights(analyticsData: AnalyticsData): Promise<BusinessInsight[]> {
    try {
      const prompt = this.buildAnalyticsPrompt(analyticsData);
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'You are an expert business analyst and freelance consultant. Analyze the provided freelance business data and generate actionable insights and recommendations. Focus on practical, specific advice that can help improve revenue, efficiency, and client relationships. Return only valid JSON.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.7,
          response_format: { type: 'json_object' }
        }),
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      const data: DeepSeekResponse = await response.json();
      const aiResponse = data.choices[0]?.message?.content;

      if (!aiResponse) {
        throw new Error('No response from DeepSeek API');
      }

      const parsedInsights = JSON.parse(aiResponse);
      return this.validateInsights(parsedInsights.insights || []);
    } catch (error) {
      console.error('DeepSeek AI analysis failed:', error);
      return this.getFallbackInsights(analyticsData);
    }
  }

  async generateProjectTypeRecommendations(projectTypes: Array<{ label: string; value: number }>): Promise<string[]> {
    try {
      const prompt = `Based on this freelancer's project distribution: ${JSON.stringify(projectTypes)}, provide exactly 3 complete, detailed strategies to diversify or optimize their service offerings for better revenue and market positioning. Each recommendation should be a full paragraph with specific actionable advice. Do not truncate or use placeholders like "---" or "...".`;

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'You are a freelance business strategist. Provide specific, actionable recommendations for service portfolio optimization.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 800,
          temperature: 0.8,
        }),
      });

      const data: DeepSeekResponse = await response.json();
      const recommendations = data.choices[0]?.message?.content
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^\d+\.?\s*/, '').trim())
        .filter(line => line.length > 30 && !line.includes('---') && !line.includes('...'))
        .slice(0, 3);

      return recommendations.length >= 3 ? recommendations : this.getFallbackProjectRecommendations();
    } catch (error) {
      console.error('Project recommendations failed:', error);
      return this.getFallbackProjectRecommendations();
    }
  }

  async analyzeProjectTypes(projects: Array<{ name: string; brief?: string }>): Promise<Array<{ label: string; value: number; emoji: string }>> {
    try {
      const prompt = `Analyze these freelance projects and categorize them into meaningful project types. For each project, consider the title and brief description to determine the most appropriate category.

Projects to analyze:
${projects.map((p, i) => `${i + 1}. Title: "${p.name}" | Description: "${p.brief || 'No description'}"`).join('\n')}

Please return a JSON object with this exact structure:
{
  "categories": [
    {
      "label": "Category Name",
      "value": number_of_projects,
      "emoji": "relevant_emoji",
      "projects": ["project_name1", "project_name2"]
    }
  ]
}

Guidelines:
- Create 3-8 meaningful categories based on the actual projects
- Use specific, descriptive category names (not just "Web Development")
- Choose relevant emojis for each category
- Ensure every project is categorized exactly once
- Categories should reflect the actual work type, not just technology used

Examples of good categories: "E-commerce Websites", "Brand Identity Design", "Mobile App Development", "Marketing Campaigns", "Content Management Systems", "SaaS Platforms", etc.`;

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'You are an expert business analyst specializing in freelance project categorization. Analyze project titles and descriptions to create meaningful, specific categories that reflect the actual work being done.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.3,
          response_format: { type: 'json_object' }
        }),
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      const data: DeepSeekResponse = await response.json();
      const aiResponse = data.choices[0]?.message?.content;

      if (!aiResponse) {
        throw new Error('No response from DeepSeek API');
      }

      const parsedResponse = JSON.parse(aiResponse);
      const categories = parsedResponse.categories || [];

      // Validate and clean the response
      const validCategories = categories
        .filter((cat: any) => cat.label && cat.value && cat.emoji)
        .map((cat: any) => ({
          label: cat.label,
          value: Math.max(1, parseInt(cat.value) || 1),
          emoji: cat.emoji
        }));

      return validCategories.length > 0 ? validCategories : this.getFallbackProjectTypes(projects);
    } catch (error) {
      console.error('AI project type analysis failed:', error);
      return this.getFallbackProjectTypes(projects);
    }
  }

  async generateRevenueOptimizationTips(revenueData: { current: number; growth: number; averageProject: number }): Promise<string[]> {
    try {
      const prompt = `Freelancer revenue analysis: Current monthly revenue: $${revenueData.current}, Growth rate: ${revenueData.growth}%, Average project value: $${revenueData.averageProject}. Provide exactly 4 complete, detailed strategies to increase revenue and pricing optimization. Each strategy should be a full paragraph with specific actionable steps. Do not use truncation markers like "---" or "...". Provide complete recommendations only.`;

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'You are a freelance pricing and revenue optimization expert. Provide practical, implementable strategies.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      const data: DeepSeekResponse = await response.json();
      const tips = data.choices[0]?.message?.content
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^\d+\.?\s*/, '').trim())
        .filter(line => line.length > 30 && !line.includes('---') && !line.includes('...'))
        .slice(0, 4);

      return tips.length >= 4 ? tips : this.getFallbackRevenueTips();
    } catch (error) {
      console.error('Revenue optimization failed:', error);
      return this.getFallbackRevenueTips();
    }
  }

  private buildAnalyticsPrompt(data: AnalyticsData): string {
    return `Analyze this freelancer's business data and generate insights:

Business Metrics:
- Total Projects: ${data.totalProjects}
- Active Projects: ${data.activeProjects}
- Completed Projects: ${data.completedProjects}
- Total Revenue: $${data.totalRevenue}
- Monthly Revenue: $${data.monthlyRevenue}
- Average Project Value: $${data.averageProjectValue}
- Total Clients: ${data.clientCount}
- Repeat Client Rate: ${data.repeatClientRate}%
- On-time Delivery: ${data.onTimeDeliveryRate}%
- Success Rate: ${data.successRate}%
- Average Project Duration: ${data.averageProjectDuration} days
- Payment Collection Speed: ${data.paymentCollectionSpeed} days
- Revenue Growth: ${data.revenueGrowth}%
- Client Satisfaction: ${data.clientSatisfaction}%

Project Types: ${JSON.stringify(data.projectTypes)}

Please return a JSON object with this structure:
{
  "insights": [
    {
      "category": "revenue|efficiency|clients|growth|risks",
      "priority": "high|medium|low",
      "title": "Brief insight title",
      "description": "Detailed analysis of the current situation",
      "recommendation": "Specific actionable recommendation",
      "impact": "Expected positive impact",
      "confidence": 85
    }
  ]
}

Generate 3-5 insights focusing on the most critical areas for business improvement.`;
  }

  private validateInsights(insights: any[]): BusinessInsight[] {
    return insights
      .filter(insight => 
        insight.category && 
        insight.title && 
        insight.description && 
        insight.recommendation
      )
      .map(insight => ({
        category: insight.category,
        priority: insight.priority || 'medium',
        title: insight.title,
        description: insight.description,
        recommendation: insight.recommendation,
        impact: insight.impact || 'Positive impact on business metrics',
        confidence: Math.min(Math.max(insight.confidence || 75, 0), 100)
      }))
      .slice(0, 5);
  }

  private getFallbackInsights(data: AnalyticsData): BusinessInsight[] {
    const insights: BusinessInsight[] = [];

    // Revenue insight
    if (data.averageProjectValue < 1000) {
      insights.push({
        category: 'revenue',
        priority: 'high',
        title: 'Low Average Project Value',
        description: `Your average project value of $${data.averageProjectValue} is below market standards.`,
        recommendation: 'Consider raising your rates or targeting higher-value projects. Package services into comprehensive solutions.',
        impact: 'Could increase revenue by 30-50%',
        confidence: 85
      });
    }

    // Client insights
    if (data.repeatClientRate < 30) {
      insights.push({
        category: 'clients',
        priority: 'high',
        title: 'Low Client Retention',
        description: `Only ${data.repeatClientRate}% of clients return for additional projects.`,
        recommendation: 'Implement a client retention strategy with follow-up communications and loyalty incentives.',
        impact: 'Reduce acquisition costs and increase lifetime value',
        confidence: 90
      });
    }

    // Efficiency insight
    if (data.paymentCollectionSpeed > 14) {
      insights.push({
        category: 'efficiency',
        priority: 'medium',
        title: 'Slow Payment Collection',
        description: `Average payment collection takes ${data.paymentCollectionSpeed} days.`,
        recommendation: 'Implement clearer payment terms, automated reminders, and consider requiring deposits.',
        impact: 'Improve cash flow and reduce administrative overhead',
        confidence: 80
      });
    }

    return insights.slice(0, 3);
  }

  private getFallbackProjectRecommendations(): string[] {
    return [
      'Diversify into complementary services like consulting or maintenance packages. This allows you to offer ongoing value to clients and create recurring revenue streams. Consider offering monthly retainer packages for website maintenance, content updates, or strategic consulting sessions.',
      'Develop specialized expertise in high-demand niches for premium pricing. Focus on becoming an expert in emerging technologies or specific industries where you can command higher rates. Invest time in learning new skills and obtaining relevant certifications to justify premium pricing.',
      'Create service bundles combining your existing skills for higher project values. Package multiple services together (design + development + marketing) to increase project scope and value. This approach reduces client acquisition costs and increases average project revenue while providing comprehensive solutions.'
    ];
  }

  getFallbackProjectTypes(projects: Array<{ name: string; brief?: string }>): Array<{ label: string; value: number; emoji: string }> {
    // Simple keyword-based categorization as fallback
    const categories = new Map<string, { label: string; emoji: string; projects: string[] }>();
    
    projects.forEach(project => {
      const text = `${project.name} ${project.brief || ''}`.toLowerCase();
      let categorized = false;
      
      // Define category mapping with keywords
      const categoryMap = [
        { keywords: ['ecommerce', 'shop', 'store', 'cart', 'product'], label: 'E-commerce Solutions', emoji: '🛒' },
        { keywords: ['brand', 'logo', 'identity', 'branding'], label: 'Brand Identity', emoji: '🎯' },
        { keywords: ['web', 'website', 'site', 'landing'], label: 'Web Development', emoji: '🌐' },
        { keywords: ['mobile', 'app', 'ios', 'android'], label: 'Mobile Applications', emoji: '📱' },
        { keywords: ['ui', 'ux', 'design', 'interface'], label: 'UI/UX Design', emoji: '🎨' },
        { keywords: ['marketing', 'seo', 'campaign', 'social'], label: 'Digital Marketing', emoji: '📊' },
        { keywords: ['content', 'blog', 'writing', 'copy'], label: 'Content Creation', emoji: '✍️' },
        { keywords: ['consult', 'strategy', 'advice', 'plan'], label: 'Consulting Services', emoji: '💡' },
        { keywords: ['saas', 'platform', 'system', 'software'], label: 'Software Development', emoji: '💻' }
      ];
      
      for (const category of categoryMap) {
        if (category.keywords.some(keyword => text.includes(keyword))) {
          if (!categories.has(category.label)) {
            categories.set(category.label, { 
              label: category.label, 
              emoji: category.emoji, 
              projects: [] 
            });
          }
          categories.get(category.label)!.projects.push(project.name);
          categorized = true;
          break;
        }
      }
      
      // Default category for uncategorized projects
      if (!categorized) {
        if (!categories.has('Other Services')) {
          categories.set('Other Services', { 
            label: 'Other Services', 
            emoji: '🔧', 
            projects: [] 
          });
        }
        categories.get('Other Services')!.projects.push(project.name);
      }
    });
    
    return Array.from(categories.values()).map(cat => ({
      label: cat.label,
      value: cat.projects.length,
      emoji: cat.emoji
    }));
  }

  private getFallbackRevenueTips(): string[] {
    return [
      'Implement value-based pricing instead of hourly rates. Focus on the business value and results you deliver rather than time spent. This approach allows you to charge based on the impact of your work, often resulting in significantly higher project values while reducing the pressure to track every hour.',
      'Offer retainer packages for ongoing work and steady income. Create monthly or quarterly service packages for maintenance, updates, and ongoing support. This provides predictable recurring revenue while building stronger long-term client relationships and reducing the constant need for new client acquisition.',
      'Upsell additional services during project discussions. When clients engage you for one service, identify complementary needs they might have. For example, if designing a website, suggest content strategy, SEO optimization, or social media setup. This increases project value and provides more comprehensive solutions.',
      'Raise rates for new clients while grandfathering existing ones. Gradually increase your rates for new projects while maintaining current rates for existing clients during their project completion. This allows you to test market acceptance of higher prices while maintaining good relationships with current clients.'
    ];
  }
}

export const deepSeekService = new DeepSeekService();