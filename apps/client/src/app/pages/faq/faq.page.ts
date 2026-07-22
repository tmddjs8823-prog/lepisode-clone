import { Component, OnInit, PLATFORM_ID, inject, signal, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ClientApiService } from '../../shared/services/client-api.service';

interface FaqCategory {
  id: number;
  name: string;
}

interface FaqItemFull {
  id: number;
  question: string;
  answer: string;
  published: boolean;
  categoryId?: number;
  sortOrder: number;
  category?: FaqCategory;
}

@Component({
  selector: 'app-faq-page',
  standalone: true,
  imports: [],
  templateUrl: './faq.page.html',
  styleUrl: './faq.page.css',
})
export class FaqPage implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private api = inject(ClientApiService);

  allFaqs = signal<FaqItemFull[]>([]);
  categories = signal<FaqCategory[]>([]);
  activeCategory = signal('전체');
  searchQuery = signal('');
  openId = signal<number | null>(null);

  filtered = computed(() => {
    const cat = this.activeCategory();
    const query = this.searchQuery().trim().toLowerCase();
    let list = this.allFaqs();

    if (cat !== '전체') {
      list = list.filter(f => f.category?.name === cat);
    }
    if (query) {
      list = list.filter(f =>
        f.question.toLowerCase().includes(query) ||
        f.answer.toLowerCase().includes(query)
      );
    }
    return list;
  });

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.api.getFaqs().subscribe({
      next: (list: any[]) => {
        const faqs = Array.isArray(list) ? list : [];
        this.allFaqs.set(faqs);
        const catMap = new Map<number, FaqCategory>();
        faqs.forEach(f => {
          if (f.category) catMap.set(f.category.id, f.category);
        });
        this.categories.set(Array.from(catMap.values()));
      },
      error: () => this.allFaqs.set([]),
    });
  }

  selectCategory(name: string): void {
    this.activeCategory.set(name);
  }

  onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  toggle(id: number): void {
    this.openId.set(this.openId() === id ? null : id);
  }
}
