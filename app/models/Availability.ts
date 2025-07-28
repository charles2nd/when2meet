export interface IMonthlyAvailability {
  id: string;
  teamId: string;
  memberId: string;
  month: string; // Format: YYYY-MM
  availability: Record<string, boolean>; // Key: YYYY-MM-DD-HH, Value: available/not
  createdAt: string;
  updatedAt: string;
}

export class MonthlyAvailability implements IMonthlyAvailability {
  public id: string;
  public teamId: string;
  public memberId: string;
  public month: string;
  public availability: Record<string, boolean>;
  public createdAt: string;
  public updatedAt: string;

  constructor(data: Partial<IMonthlyAvailability>) {
    this.id = data.id || this.generateId();
    this.teamId = this.validateId(data.teamId, 'Team ID');
    this.memberId = this.validateId(data.memberId, 'Member ID');
    this.month = this.validateMonth(data.month || '');
    this.availability = data.availability || {};
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  private generateId(): string {
    return `availability-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private validateId(id: string | undefined, fieldName: string): string {
    if (!id || id.trim().length === 0) {
      throw new Error(`${fieldName} is required`);
    }
    return id.trim();
  }

  private validateMonth(month: string): string {
    if (!month) {
      throw new Error('Month is required');
    }
    
    const monthRegex = /^\d{4}-\d{2}$/;
    if (!monthRegex.test(month)) {
      throw new Error('Month must be in YYYY-MM format');
    }
    
    return month;
  }

  public setAvailability(date: string, hour: number, available: boolean): void {
    const key = `${date}-${hour}`;
    this.availability[key] = available;
    this.updatedAt = new Date().toISOString();
  }

  public getAvailability(date: string, hour: number): boolean {
    const key = `${date}-${hour}`;
    return this.availability[key] || false;
  }

  public setDayAvailability(date: string, hours: number[], available: boolean): void {
    hours.forEach(hour => {
      this.setAvailability(date, hour, available);
    });
  }

  public getDayAvailability(date: string): Record<number, boolean> {
    const dayAvailability: Record<number, boolean> = {};
    
    Object.keys(this.availability).forEach(key => {
      const [keyDate, hourStr] = key.split('-').slice(-2);
      if (keyDate === date.split('-').slice(-1)[0]) {
        const hour = parseInt(hourStr, 10);
        if (!isNaN(hour)) {
          dayAvailability[hour] = this.availability[key];
        }
      }
    });
    
    return dayAvailability;
  }

  public getAvailableDates(): string[] {
    const dates = new Set<string>();
    
    Object.keys(this.availability).forEach(key => {
      if (this.availability[key]) {
        const datePart = key.split('-').slice(0, 3).join('-');
        dates.add(datePart);
      }
    });
    
    return Array.from(dates).sort();
  }

  public getTotalAvailableHours(): number {
    return Object.values(this.availability).filter(Boolean).length;
  }

  public clearMonth(): void {
    this.availability = {};
    this.updatedAt = new Date().toISOString();
  }

  public toJSON(): IMonthlyAvailability {
    return {
      id: this.id,
      teamId: this.teamId,
      memberId: this.memberId,
      month: this.month,
      availability: { ...this.availability },
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  public static fromJSON(data: IMonthlyAvailability): MonthlyAvailability {
    return new MonthlyAvailability(data);
  }

  public validate(): boolean {
    try {
      this.validateId(this.teamId, 'Team ID');
      this.validateId(this.memberId, 'Member ID');
      this.validateMonth(this.month);
      return true;
    } catch {
      return false;
    }
  }
}