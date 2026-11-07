/**
 * DANASI OPPORTUNITY HUB — Base Provider Adapter
 * Founder: NDAYIZEYE Samuel
 * 
 * Provides common utilities for data sanitization, SSRF protection,
 * category classification, and cryptographic content hashing.
 */

import crypto from 'crypto';
import {
  WorkplaceArrangement,
  EmploymentType,
  ExperienceLevel,
  EducationLevel
} from '../../types/index.ts';

export abstract class BaseProvider {
  /**
   * Sanitizes and strips HTML markup from job descriptions.
   */
  public cleanHtml(rawHtml: string): string {
    if (!rawHtml) return '';
    return rawHtml
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Validates external URLs to prevent SSRF and disallow forbidden schemes.
   */
  public sanitizeUrl(urlStr: string): string | null {
    if (!urlStr || typeof urlStr !== 'string') return null;
    const trimmed = urlStr.trim();
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return null;
      }
      const host = parsed.hostname.toLowerCase();
      // Block local/private address spaces
      if (
        host === 'localhost' ||
        host === '127.0.0.1' ||
        host === '::1' ||
        host.startsWith('10.') ||
        host.startsWith('192.168.') ||
        host.startsWith('172.16.') ||
        host.startsWith('169.254.')
      ) {
        return null;
      }
      return parsed.toString();
    } catch {
      return null;
    }
  }

  /**
   * Computes a SHA-256 fingerprint from key vacancy attributes.
   */
  public calculateContentHash(title: string, employer: string, desc: string): string {
    const norm = `${title.toLowerCase().trim()}|${employer.toLowerCase().trim()}|${desc.slice(0, 300).toLowerCase().trim()}`;
    return crypto.createHash('sha256').update(norm).digest('hex');
  }

  /**
   * Classifies job details into one of the 12 core DANASI job categories.
   */
  public mapCategory(categoryHint?: string, titleHint?: string, locationHint?: string): string {
    const text = `${categoryHint || ''} ${titleHint || ''} ${locationHint || ''}`.toLowerCase();

    if (text.includes('rwanda') || text.includes('kigali')) {
      return 'rwanda-jobs';
    }
    if (text.includes('intern') || text.includes('trainee') || text.includes('stage')) {
      return 'internships';
    }
    if (text.includes('fellow') || text.includes('scholar') || text.includes('researcher')) {
      return 'fellowships';
    }
    if (text.includes('volunteer') || text.includes('bénévole')) {
      return 'volunteer-opportunities';
    }
    if (text.includes('remote') || text.includes('anywhere') || text.includes('work from home') || text.includes('telecommute')) {
      return 'remote-jobs';
    }
    if (text.includes('ministry') || text.includes('government') || text.includes('public sector') || text.includes('mifotra') || text.includes('gouvernement')) {
      return 'government-jobs';
    }
    if (text.includes('un ') || text.includes('united nations') || text.includes('ngo') || text.includes('foundation') || text.includes('humanitarian') || text.includes('who') || text.includes('unicef') || text.includes('undp')) {
      return 'ngo-jobs';
    }
    if (text.includes('entry') || text.includes('junior') || text.includes('associate') || text.includes('fresh graduate')) {
      return 'entry-level-jobs';
    }
    if (text.includes('part-time') || text.includes('freelance') || text.includes('hourly')) {
      return 'part-time-jobs';
    }
    if (text.includes('international') || text.includes('global') || text.includes('worldwide') || text.includes('europe') || text.includes('usa')) {
      return 'international-jobs';
    }
    if (text.includes('full-time') || text.includes('permanent')) {
      return 'full-time-jobs';
    }
    return 'private-sector-jobs';
  }

  /**
   * Normalizes employment type strings.
   */
  public normalizeEmploymentType(typeStr?: string): EmploymentType {
    if (!typeStr) return 'Full-Time';
    const s = typeStr.toLowerCase();
    if (s.includes('part') || s.includes('freelance')) return 'Part-Time';
    if (s.includes('intern')) return 'Internship';
    if (s.includes('fellow')) return 'Fellowship';
    if (s.includes('volunteer')) return 'Volunteer';
    if (s.includes('contract') || s.includes('temporary')) return 'Contract';
    return 'Full-Time';
  }

  /**
   * Normalizes workplace arrangement.
   */
  public normalizeWorkplace(arrangementStr?: string, isRemote?: boolean): WorkplaceArrangement {
    if (isRemote === true) return 'remote';
    if (!arrangementStr) return 'on-site';
    const s = arrangementStr.toLowerCase();
    if (s.includes('remote') || s.includes('anywhere')) return 'remote';
    if (s.includes('hybrid')) return 'hybrid';
    return 'on-site';
  }

  /**
   * Maps experience levels.
   */
  public normalizeExperienceLevel(text?: string): ExperienceLevel {
    if (!text) return 'Mid-Level';
    const s = text.toLowerCase();
    if (s.includes('lead') || s.includes('principal') || s.includes('director') || s.includes('executive') || s.includes('head')) {
      return 'Executive';
    }
    if (s.includes('senior') || s.includes('sr.') || s.includes('architect') || s.includes('expert')) {
      return 'Senior';
    }
    if (s.includes('junior') || s.includes('jr.') || s.includes('entry') || s.includes('intern') || s.includes('trainee') || s.includes('graduate')) {
      return 'Entry-Level';
    }
    return 'Mid-Level';
  }

  /**
   * Maps education requirements.
   */
  public normalizeEducationRequirement(text?: string): EducationLevel {
    if (!text) return "Bachelor's Degree";
    const s = text.toLowerCase();
    if (s.includes('phd') || s.includes('doctorate')) return 'Doctorate / PhD';
    if (s.includes('master') || s.includes('mba') || s.includes('msc')) return "Master's Degree";
    if (s.includes('bachelor') || s.includes('degree') || s.includes('license')) return "Bachelor's Degree";
    if (s.includes('diploma') || s.includes('tvet') || s.includes('vocational') || s.includes('a2')) return 'Diploma / TVET';
    if (s.includes('high school') || s.includes('secondary') || s.includes('a-level')) return 'High School';
    return 'Self-Taught / Professional';
  }
}
