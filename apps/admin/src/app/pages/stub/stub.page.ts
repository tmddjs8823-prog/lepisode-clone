import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'admin-stub-page',
  templateUrl: './stub.page.html',
})
export class StubPage {
  private route = inject(ActivatedRoute);

  title = this.route.snapshot.data['title'] ?? '페이지';
}

