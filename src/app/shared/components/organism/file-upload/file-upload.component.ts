import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../atomics';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="space-y-3 w-full">
      <!-- Dropzone Area -->
      <div
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
        (click)="fileInput.click()"
        [class]="dropzoneClasses()"
        class="border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200"
      >
        <input
          #fileInput
          type="file"
          [multiple]="multiple()"
          [accept]="accept()"
          (change)="onFileChange($event)"
          class="hidden"
        />

        <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 mb-3 shadow-xs">
          <app-icon name="upload" size="lg"></app-icon>
        </div>

        <h4 class="text-sm font-bold text-slate-800">{{ title() }}</h4>
        <p class="text-xs text-slate-400 mt-1 max-w-sm mx-auto">{{ description() }}</p>
        <span class="inline-block mt-2 text-[11px] text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full font-mono">
          Máximo {{ maxSizeMb() }} MB por archivo
        </span>
      </div>

      <!-- Error Message -->
      @if (errorMessage()) {
        <p class="text-xs text-rose-600 font-medium">{{ errorMessage() }}</p>
      }

      <!-- Selected Files Preview List -->
      @if (selectedFiles().length > 0) {
        <div class="space-y-2 pt-2">
          <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Archivos seleccionados ({{ selectedFiles().length }})
          </span>

          <div class="space-y-2">
            @for (file of selectedFiles(); track file.name; let idx = $index) {
              <div class="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white shadow-xs">
                <div class="flex items-center gap-3 min-w-0 pr-2">
                  <div class="p-2 rounded-lg bg-slate-100 text-slate-600 flex-shrink-0">
                    <app-icon name="file" size="md"></app-icon>
                  </div>
                  <div class="min-w-0">
                    <p class="text-xs font-semibold text-slate-800 truncate">{{ file.name }}</p>
                    <span class="text-[11px] text-slate-400">{{ formatFileSize(file.size) }}</span>
                  </div>
                </div>

                <button
                  type="button"
                  (click)="removeFile(idx, $event)"
                  class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer flex-shrink-0"
                  title="Eliminar archivo"
                >
                  <app-icon name="trash" size="sm"></app-icon>
                </button>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class FileUploadComponent {
  multiple = input<boolean>(false);
  accept = input<string>('*');
  maxSizeMb = input<number>(10);
  title = input<string>('Haz clic o arrastra archivos aquí');
  description = input<string>('Soporta documentos, imágenes y paquetes comprimidos.');

  filesSelected = output<File[]>();
  fileRemoved = output<File>();

  isDragging = signal<boolean>(false);
  selectedFiles = signal<File[]>([]);
  errorMessage = signal<string>('');

  dropzoneClasses(): string {
    if (this.isDragging()) {
      return 'border-brand-500 bg-brand-50/60 scale-[1.01]';
    }
    return 'border-slate-300 hover:border-brand-400 bg-slate-50/50 hover:bg-white';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    if (event.dataTransfer?.files) {
      this.handleFiles(Array.from(event.dataTransfer.files));
    }
  }

  onFileChange(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    if (inputEl.files) {
      this.handleFiles(Array.from(inputEl.files));
    }
  }

  private handleFiles(incoming: File[]): void {
    this.errorMessage.set('');
    const maxBytes = this.maxSizeMb() * 1024 * 1024;
    const valid: File[] = [];

    for (const f of incoming) {
      if (f.size > maxBytes) {
        this.errorMessage.set(`El archivo "${f.name}" supera el límite de ${this.maxSizeMb()}MB.`);
        return;
      }
      valid.push(f);
    }

    const next = this.multiple() ? [...this.selectedFiles(), ...valid] : valid;
    this.selectedFiles.set(next);
    this.filesSelected.emit(next);
  }

  removeFile(index: number, event: Event): void {
    event.stopPropagation();
    const removed = this.selectedFiles()[index];
    this.selectedFiles.update((list) => list.filter((_, i) => i !== index));
    this.fileRemoved.emit(removed);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}
