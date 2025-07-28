export interface ITimeSlot {
  date: string; // YYYY-MM-DD
  hour: number; // 0-23
  available: boolean;
}

export interface IAvailability {
  userId: string;
  groupId: string;
  slots: ITimeSlot[];
  updatedAt: string;
}

export class Availability implements IAvailability {
  userId: string;
  groupId: string;
  slots: ITimeSlot[];
  updatedAt: string;

  constructor(data: Partial<IAvailability>) {
    this.userId = data.userId || '';
    this.groupId = data.groupId || '';
    this.slots = data.slots || [];
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  setSlot(date: string, hour: number, available: boolean): void {
    const existingIndex = this.slots.findIndex(
      slot => slot.date === date && slot.hour === hour
    );

    if (existingIndex >= 0) {
      this.slots[existingIndex].available = available;
    } else {
      this.slots.push({ date, hour, available });
    }
    
    this.updatedAt = new Date().toISOString();
  }

  getSlot(date: string, hour: number): boolean {
    const slot = this.slots.find(
      s => s.date === date && s.hour === hour
    );
    return slot?.available || false;
  }

  clearDay(date: string): void {
    this.slots = this.slots.filter(slot => slot.date !== date);
    this.updatedAt = new Date().toISOString();
  }

  toJSON(): IAvailability {
    return {
      userId: this.userId,
      groupId: this.groupId,
      slots: this.slots,
      updatedAt: this.updatedAt
    };
  }

  static fromJSON(data: IAvailability): Availability {
    return new Availability(data);
  }
}