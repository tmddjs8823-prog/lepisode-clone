import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  forwardRef,
  signal,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Component({
  selector: 'admin-rich-editor',
  templateUrl: './rich-editor.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RichEditorComponent),
      multi: true,
    },
  ],
  host: {
    'class': 'flex flex-col flex-1 min-h-0'
  }
})
export class RichEditorComponent implements ControlValueAccessor, AfterViewInit {
  @ViewChild('editorEl') editorEl!: ElementRef<HTMLDivElement>;

  disabled = false;
  showLinkInput = signal(false);
  linkUrl = signal('');
  showColorPicker = signal(false);
  showBgPicker = signal(false);

  readonly colors = [
    '#000000','#374151','#6B7280','#9CA3AF','#D1D5DB','#FFFFFF',
    '#EF4444','#F97316','#EAB308','#22C55E','#3B82F6','#8B5CF6',
    '#EC4899','#06B6D4','#10B981','#F59E0B','#6366F1','#84CC16',
  ];

  private _onChange: (v: string) => void = () => {};
  private _onTouched: () => void = () => {};
  private _savedRange: Range | null = null;

  ngAfterViewInit(): void {
    const el = this.editorEl.nativeElement;
    el.addEventListener('input', () => this._onChange(el.innerHTML));
    el.addEventListener('blur', () => this._onTouched());
    // Default paragraph on enter
    el.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        const block = this._getBlock();
        if (block && ['BLOCKQUOTE', 'PRE'].includes(block.tagName)) return;
        document.execCommand('insertParagraph', false);
        e.preventDefault();
      }
    });
  }

  /* ─── ControlValueAccessor ─── */
  writeValue(val: string): void {
    if (this.editorEl?.nativeElement) {
      this.editorEl.nativeElement.innerHTML = val ?? '';
    }
  }
  registerOnChange(fn: (v: string) => void): void { this._onChange = fn; }
  registerOnTouched(fn: () => void): void { this._onTouched = fn; }
  setDisabledState(d: boolean): void { this.disabled = d; }

  /* ─── 커서 저장/복원 ─── */
  saveRange(): void {
    const sel = window.getSelection();
    if (sel && sel.rangeCount) this._savedRange = sel.getRangeAt(0).cloneRange();
  }
  restoreRange(): void {
    if (!this._savedRange) { this.editorEl.nativeElement.focus(); return; }
    const sel = window.getSelection();
    if (sel) { sel.removeAllRanges(); sel.addRange(this._savedRange); }
  }

  /* ─── 실행 헬퍼 ─── */
  exec(cmd: string, val?: string): void {
    this.editorEl.nativeElement.focus();
    document.execCommand(cmd, false, val ?? undefined);
    this._onChange(this.editorEl.nativeElement.innerHTML);
  }

  formatBlock(tag: string): void {
    this.editorEl.nativeElement.focus();
    document.execCommand('formatBlock', false, tag);
    this._onChange(this.editorEl.nativeElement.innerHTML);
  }

  isActive(cmd: string): boolean {
    try { return document.queryCommandState(cmd); } catch { return false; }
  }

  /* ─── 링크 ─── */
  openLink(): void {
    this.saveRange();
    this.showColorPicker.set(false);
    this.showBgPicker.set(false);
    this.showLinkInput.update(v => !v);
    if (this.showLinkInput()) this.linkUrl.set('');
  }
  insertLink(): void {
    const url = this.linkUrl().trim();
    if (!url) return;
    this.restoreRange();
    this.exec('createLink', url.startsWith('http') ? url : `https://${url}`);
    this.showLinkInput.set(false);
  }

  /* ─── 컬러 ─── */
  applyColor(color: string): void {
    this.restoreRange();
    this.exec('foreColor', color);
    this.showColorPicker.set(false);
  }
  applyBgColor(color: string): void {
    this.restoreRange();
    this.exec('hiliteColor', color);
    this.showBgPicker.set(false);
  }
  openColorPicker(): void {
    this.saveRange();
    this.showBgPicker.set(false);
    this.showColorPicker.update(v => !v);
  }
  openBgPicker(): void {
    this.saveRange();
    this.showColorPicker.set(false);
    this.showBgPicker.update(v => !v);
  }

  /* ─── 이미지 ─── */
  insertImage(): void {
    const url = prompt('이미지 URL을 입력하세요:');
    if (url) this.exec('insertImage', url);
  }

  private _getBlock(): HTMLElement | null {
    const sel = window.getSelection();
    if (!sel?.rangeCount) return null;
    let node: Node | null = sel.getRangeAt(0).commonAncestorContainer;
    while (node && node.nodeType !== 1) node = node.parentNode;
    return node as HTMLElement | null;
  }
}
