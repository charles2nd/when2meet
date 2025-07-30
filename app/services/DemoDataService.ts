import { Group } from '../models/Group';
import { Availability } from '../models/SimpleAvailability';
import { LocalStorage } from './LocalStorage';

export class DemoDataService {
  private static readonly DEMO_GROUP_CODE = 'TEST999';
  private static readonly DEMO_GROUP_ID = 'demo-group-test999';
  
  // Fake student player data with realistic schedules
  private static readonly FAKE_PLAYERS = [
    { 
      id: 'player-1', 
      name: 'Alex ProGamer Smith', 
      availability: 0.15,
      schedule: 'night_owl', // Available late evenings, busy with classes during day
      busyDays: ['monday', 'wednesday', 'friday'] // Heavy class schedule
    },
    { 
      id: 'player-2', 
      name: 'Sarah Sniper Jones', 
      availability: 0.12,
      schedule: 'afternoon', // Free afternoons but busy mornings/evenings
      busyDays: ['tuesday', 'thursday'] // Lab days
    },
    { 
      id: 'player-3', 
      name: 'Mike Tank Wilson', 
      availability: 0.18,
      schedule: 'consistent', // Regular schedule but has part-time job
      busyDays: ['saturday', 'sunday'] // Works weekends
    },
    { 
      id: 'player-4', 
      name: 'Emma Support Davis', 
      availability: 0.08,
      schedule: 'weekend_only', // Very busy student, mostly weekends free
      busyDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    },
    { 
      id: 'player-5', 
      name: 'Chris Flex Brown', 
      availability: 0.14,
      schedule: 'random', // Unpredictable schedule
      busyDays: [] // Random busy periods
    },
    { 
      id: 'player-6', 
      name: 'Jessica IGL Taylor', 
      availability: 0.16,
      schedule: 'evening', // Available evenings, busy with studies during day
      busyDays: ['sunday'] // Study day
    },
  ];

  /**
   * Initialize the demo group with fake data for 2025
   * Only accessible in demo mode
   */
  static async initializeDemoGroup(forceRegenerate: boolean = false): Promise<void> {
    console.log('[DEMO] Initializing demo group TEST999...');
    
    // Check if demo group already exists
    const existingGroup = await LocalStorage.findGroupByCode(this.DEMO_GROUP_CODE);
    if (existingGroup && !forceRegenerate) {
      console.log('[DEMO] Demo group already exists:', existingGroup.name, 'Code:', existingGroup.code);
      return;
    }
    
    console.log('[DEMO] Creating new demo group with code:', this.DEMO_GROUP_CODE);

    // Clean up existing demo data if regenerating
    if (forceRegenerate && existingGroup) {
      console.log('[DEMO] Force regenerating demo data...');
      await this.cleanupDemoData();
    }

    // Create the demo group with explicit code
    const demoGroup = new Group({
      id: this.DEMO_GROUP_ID,
      name: 'University Gaming Club - CS2 Team',
      code: this.DEMO_GROUP_CODE, // Explicitly set TEST999
      members: this.FAKE_PLAYERS.map(p => p.id),
      adminId: this.FAKE_PLAYERS[0].id, // Alex is admin
      createdAt: '2025-01-01T00:00:00.000Z'
    });
    
    // Ensure the code is set correctly
    demoGroup.code = this.DEMO_GROUP_CODE;
    console.log('[DEMO] Demo group code set to:', demoGroup.code);

    // Save the demo group
    await LocalStorage.saveGroup(demoGroup);
    console.log('[DEMO] Demo group created and saved:', demoGroup.name, 'Code:', demoGroup.code, 'ID:', demoGroup.id);
    
    // Verify it was saved by trying to find it
    const verifyGroup = await LocalStorage.findGroupByCode(this.DEMO_GROUP_CODE);
    console.log('[DEMO] Verification - group found:', !!verifyGroup, verifyGroup?.name);

    // Generate availability data for all fake players for 2025
    await this.generateAvailabilityData(demoGroup);
    
    console.log('[DEMO] Demo group initialization complete');
  }

  /**
   * Generate realistic availability data for all fake players for 2025
   */
  private static async generateAvailabilityData(group: Group): Promise<void> {
    console.log('[DEMO] Generating availability data for 2025...');

    for (const player of this.FAKE_PLAYERS) {
      const availability = new Availability({
        userId: player.id,
        groupId: group.id,
        slots: [],
        updatedAt: new Date().toISOString()
      });

      // Generate availability for entire year 2025
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-12-31');
      
      for (let currentDate = new Date(startDate); currentDate <= endDate; currentDate.setDate(currentDate.getDate() + 1)) {
        const dateString = currentDate.toISOString().split('T')[0];
        
        // Generate availability for each hour of the day
        for (let hour = 0; hour < 24; hour++) {
          let isAvailable = false;
          
          // Create realistic availability patterns based on player preferences
          const availabilityChance = this.getAvailabilityChance(player, hour, currentDate.getDay());
          isAvailable = Math.random() < availabilityChance;
          
          if (isAvailable) {
            availability.setSlot(dateString, hour, true);
          }
        }
      }

      // Save player availability
      await LocalStorage.saveAvailability(availability);
      console.log(`[DEMO] Generated availability for ${player.name}: ${availability.slots.filter(s => s.available).length} available slots`);
    }
  }

  /**
   * Calculate realistic availability for student team members
   */
  private static getAvailabilityChance(player: any, hour: number, dayOfWeek: number): number {
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = dayNames[dayOfWeek];
    
    // Check if this is a busy day for the player
    if (player.busyDays.includes(currentDay)) {
      return 0.01; // Almost never available on busy days
    }

    let baseChance = 0.05; // Start with very low base chance to ensure many empty slots
    
    // Apply schedule-specific patterns
    switch (player.schedule) {
      case 'night_owl': // Alex - Available late nights
        if (hour >= 22 || hour <= 2) {
          baseChance = 0.4; // Medium chance late night
        } else if (hour >= 19 && hour <= 21) {
          baseChance = 0.2; // Low chance early evening
        } else if (hour >= 8 && hour <= 17) {
          baseChance = 0.02; // Very low during class hours
        }
        break;
        
      case 'afternoon': // Sarah - Free afternoons
        if (hour >= 13 && hour <= 17) {
          baseChance = 0.3; // Medium chance afternoons
        } else if (hour >= 8 && hour <= 12) {
          baseChance = 0.01; // Classes in morning
        } else if (hour >= 18 && hour <= 22) {
          baseChance = 0.01; // Busy evenings
        }
        break;
        
      case 'consistent': // Mike - Regular but has job
        if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Weekdays
          if (hour >= 19 && hour <= 22) {
            baseChance = 0.25; // Available evenings on weekdays
          } else if (hour >= 8 && hour <= 18) {
            baseChance = 0.02; // School/work hours
          }
        }
        // Weekends he works, so very low availability
        break;
        
      case 'weekend_only': // Emma - Only weekends free
        if (dayOfWeek === 0 || dayOfWeek === 6) { // Weekends
          if (hour >= 14 && hour <= 22) {
            baseChance = 0.5; // Good availability on weekend afternoons/evenings
          } else if (hour >= 10 && hour <= 13) {
            baseChance = 0.2; // Low availability weekend mornings
          }
        }
        // Weekdays are busy days, handled above
        break;
        
      case 'random': // Chris - Unpredictable
        // Add random patterns with some preferred times
        if (hour >= 16 && hour <= 20) {
          baseChance = 0.15 + (Math.random() * 0.15); // Random but slightly better evenings
        } else {
          baseChance = Math.random() * 0.12; // Random availability
        }
        break;
        
      case 'evening': // Jessica - Evening availability
        if (hour >= 18 && hour <= 21) {
          baseChance = 0.3; // Medium chance early evenings
        } else if (hour >= 8 && hour <= 17) {
          baseChance = 0.02; // Study time during day
        } else if (hour >= 22 || hour <= 7) {
          baseChance = 0.01; // Sleep time
        }
        break;
    }

    // Small weekend boost for most players (except those who work weekends)
    if ((dayOfWeek === 0 || dayOfWeek === 6) && player.schedule !== 'consistent') {
      baseChance *= 1.1; // Reduced boost
    }

    // Add some randomness to make it more realistic
    baseChance += (Math.random() - 0.5) * 0.05;
    
    // Exam periods - randomly make some weeks busier (simulate midterms/finals)
    const weekOfYear = Math.floor(Math.random() * 52);
    if (weekOfYear % 8 === 0 || weekOfYear % 15 === 0) { // Exam weeks
      baseChance *= 0.2; // Even lower during exams
    }

    // Add more random "life happens" events that reduce availability
    if (Math.random() < 0.15) { // 15% chance of life event reducing availability
      baseChance *= 0.3;
    }

    // Cap between 0 and 1, but keep it realistic (max 60%)
    return Math.min(Math.max(baseChance, 0), 0.6);
  }

  /**
   * Check if a group code is the demo group
   */
  static isDemoGroup(code: string): boolean {
    return code.toUpperCase() === this.DEMO_GROUP_CODE;
  }

  /**
   * Get demo group information
   */
  static getDemoGroupInfo() {
    return {
      code: this.DEMO_GROUP_CODE,
      id: this.DEMO_GROUP_ID,
      playerCount: this.FAKE_PLAYERS.length,
      players: this.FAKE_PLAYERS
    };
  }

  /**
   * Check if user is a demo player
   */
  static isDemoPlayer(userId: string): boolean {
    return this.FAKE_PLAYERS.some(player => player.id === userId);
  }

  /**
   * Clean up demo data (for testing purposes)
   */
  static async cleanupDemoData(): Promise<void> {
    console.log('[DEMO] Cleaning up demo data...');
    
    // Remove demo group
    const demoGroup = await LocalStorage.findGroupByCode(this.DEMO_GROUP_CODE);
    if (demoGroup) {
      // Remove all availability data for demo players
      for (const player of this.FAKE_PLAYERS) {
        try {
          await LocalStorage.removeAvailability(player.id, demoGroup.id);
          console.log(`[DEMO] Removed availability for ${player.name}`);
        } catch (error) {
          console.log(`[DEMO] Could not remove availability for ${player.id}:`, error);
        }
      }
      
      // Remove the demo group itself
      await LocalStorage.removeGroup(demoGroup.id);
      console.log('[DEMO] Demo group removed');
    }
    
    console.log('[DEMO] Demo data cleanup complete');
  }
}