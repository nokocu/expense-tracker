import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import * as enTranslations from '../i18n/en.json';
import * as plTranslations from '../i18n/pl.json';

export type Language = 'en' | 'pl';

interface Translations {
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private readonly LANGUAGE_STORAGE_KEY = 'selectedLanguage';
  
  // load from JSON
  private readonly translations: Record<Language, Translations> = {
    en: enTranslations,
    pl: plTranslations
  };

  private languageSubject = new BehaviorSubject<Language>(this.getStoredLanguage());
  
  language$ = this.languageSubject.asObservable();

  constructor() {}

  private getStoredLanguage(): Language {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(this.LANGUAGE_STORAGE_KEY) as Language;
      return stored && (stored === 'en' || stored === 'pl') ? stored : 'en';
    }
    return 'en';
  }

  setLanguage(language: Language): void {
    this.languageSubject.next(language);
    
    // persist to localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.LANGUAGE_STORAGE_KEY, language);
    }
  }

  getCurrentLanguage(): Language {
    return this.languageSubject.value;
  }

  toggleLanguage(): void {
    const currentLang = this.getCurrentLanguage();
    const newLang: Language = currentLang === 'en' ? 'pl' : 'en';
    this.setLanguage(newLang);
  }

  translate(key: string): string {
    const currentLang = this.getCurrentLanguage();
    const translation = this.getNestedValue(this.translations[currentLang], key);
    
    if (translation === undefined) {
      console.warn(`Translation missing for key: ${key} in language: ${currentLang}`);
      // return the last part of the key instead of the full key
      const keyParts = key.split('.');
      return keyParts[keyParts.length - 1];
    }
    
    return translation;
  }

  translate$(key: string): Observable<string> {
    return new Observable(observer => {
      const subscription = this.language$.subscribe(() => {
        observer.next(this.translate(key));
      });
      
      return () => subscription.unsubscribe();
    });
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }
}
