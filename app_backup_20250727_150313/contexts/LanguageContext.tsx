import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'fr' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isLoaded: boolean;
}

const translations = {
  fr: {
    // Navigation
    'nav.meet': 'Rencontre',
    'nav.groups': 'Équipes',
    'nav.profile': 'Profil',
    
    // Meet Screen
    'meet.title': 'Rencontre',
    'meet.subtitle': 'Planifiez et coordonnez avec {{team}}',
    'meet.loading': 'Chargement des événements...',
    'meet.headerInfo': 'Créez des événements pour connaître les disponibilités de votre équipe et trouvez le meilleur moment pour vous rencontrer',
    'meet.quickActions': 'ACTIONS RAPIDES',
    'meet.activeEvents.helper': 'Cliquez sur un événement pour voir les réponses et gérer les disponibilités',
    'meet.upcomingEvents.helper': 'Événements planifiés basés sur les disponibilités de l\'équipe',
    'meet.createAction.title': 'Créer un Événement de Disponibilité',
    'meet.createAction.description': 'Trouvez le meilleur moment pour votre équipe',
    'meet.activeEvents.title': 'Événements de Disponibilité Actifs',
    'meet.activeEvents.empty.title': 'Aucun événement actif',
    'meet.activeEvents.empty.description': 'Créez un événement de disponibilité pour trouver le meilleur moment pour votre équipe',
    'meet.event.responseLabel': 'Réponse',
    'meet.event.responsesLabel': 'Réponses',
    'meet.event.respondedStatus': '{{responses}}/{{total}} ont répondu',
    'meet.upcomingEvents.title': 'Événements à Venir',
    'meet.upcomingEvents.empty.title': 'Aucun événement à venir',
    'meet.upcomingEvents.empty.description': 'Les événements du calendrier apparaîtront ici',
    'meet.calendar.participants': '{{count}} participants',
    'meet.calendar.viewAvailability': 'Voir Disponibilité',
    
    // Groups Screen
    'groups.title': 'Gestion d\'Équipe',
    'groups.subtitle': 'Votre équipe de jeu et événements de disponibilité',
    'groups.loading': 'Chargement de l\'équipe...',
    'groups.headerInfo': 'Gérez votre équipe et créez des événements pour organiser vos rencontres',
    'groups.teamInfo': 'INFORMATIONS DE L\'ÉQUIPE',
    'groups.quickActions': 'ACTIONS RAPIDES',
    'groups.eventsSection': 'ÉVÉNEMENTS DE L\'ÉQUIPE',
    'groups.team.membersTitle': 'Membres de l\'Équipe ({{count}})',
    'groups.team.you': '(Vous)',
    'groups.quickAction.title': 'Créer un Événement de Disponibilité',
    'groups.quickAction.description': 'Trouvez le meilleur moment pour votre équipe',
    'groups.activeEvents.title': 'Événements Actifs ({{count}})',
    'groups.activeEvents.empty': 'Aucun événement actif. Créez-en un pour commencer!',
    'groups.event.shareLabel': 'Partager',
    'groups.event.passwordProtected': 'Protégé par mot de passe',
    'groups.noTeam': 'Aucune équipe trouvée',
    'groups.createEvent.modalTitle': 'Créer un Événement',
    'groups.createEvent.success': 'Événement créé avec succès!',
    'groups.createEvent.validation.titleRequired': 'Le titre de l\'événement est requis',
    'groups.createEvent.validation.datesRequired': 'Les dates de début et de fin sont requises',
    'groups.createEvent.form.title': 'Titre de l\'Événement',
    'groups.createEvent.form.titlePlaceholder': 'ex. Session d\'Entraînement Hebdomadaire',
    'groups.createEvent.form.description': 'Description',
    'groups.createEvent.form.descriptionPlaceholder': 'Description optionnelle',
    'groups.createEvent.form.dateRange': 'Période de disponibilité',
    'groups.createEvent.form.dateRangeHelper': 'Sélectionnez les dates pendant lesquelles vous souhaitez connaître les disponibilités',
    'groups.createEvent.form.startDatePlaceholder': 'Début',
    'groups.createEvent.form.endDatePlaceholder': 'Fin',
    'groups.createEvent.form.timeRange': 'Plage horaire quotidienne',
    'groups.createEvent.form.timeRangeHelper': 'Définissez les heures à vérifier chaque jour',
    'groups.createEvent.form.requirePassword': 'Exiger un mot de passe',
    'groups.createEvent.form.password': 'Mot de passe',
    'groups.createEvent.form.passwordPlaceholder': 'Entrez le mot de passe',
    
    // Profile Screen
    'profile.title': 'Profil',
    'profile.subtitle': 'Votre profil de jeu et statistiques',
    'profile.current_team': 'Équipe Actuelle',
    'profile.activity_stats': 'Statistiques d\'Activité',
    'profile.response_rate': 'Taux de Réponse',
    'profile.events_joined': 'Événements Rejoints',
    'profile.total_events': 'Total Événements',
    'profile.settings': 'Paramètres',
    'profile.notifications': 'Notifications',
    'profile.timezone': 'Fuseau Horaire',
    'profile.language': 'Langue',
    'profile.help': 'Aide et Support',
    'profile.loading': 'Chargement du profil...',
    
    // Event Creation
    'event.create_title': 'Créer un Événement',
    'event.cancel': 'Annuler',
    'event.create': 'Créer',
    'event.title_label': 'Titre de l\'Événement *',
    'event.title_placeholder': 'ex. Session d\'Entraînement Hebdomadaire',
    'event.description_label': 'Description',
    'event.description_placeholder': 'Description optionnelle',
    'event.start_date': 'Date de Début *',
    'event.end_date': 'Date de Fin *',
    'event.start_time': 'Heure de Début',
    'event.end_time': 'Heure de Fin',
    'event.require_password': 'Exiger un mot de passe',
    'event.password': 'Mot de passe',
    'event.password_placeholder': 'Entrez le mot de passe',
    'event.success': 'Événement créé avec succès!',
    'event.error_title': 'Le titre de l\'événement est requis',
    'event.error_dates': 'Les dates de début et de fin sont requises',
    
    // Roles
    'role.coach': 'Entraîneur',
    'role.igl': 'Leader',
    'role.player': 'Joueur',
    'role.sub': 'Remplaçant',
    'profile.role.coach': 'Entraîneur',
    'profile.role.igl': 'Leader',
    'profile.role.player': 'Joueur',
    'profile.role.sub': 'Remplaçant',
    
    // Event Types
    'event_type.tournament': 'Tournoi',
    'event_type.practice': 'Entraînement',
    'event_type.scrim': 'Match d\'Entraînement',
    'event_type.game': 'Match',
    'event_type.day_off': 'Jour de Repos',
    
    // Common
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    'common.cancel': 'Annuler',
    'common.create': 'Créer',
    'common.participants': 'participants',
    'common.responses': 'réponses',
    'common.share': 'Partager',
    'common.password_protected': 'Protégé par mot de passe',
    'common.you': '(Vous)',
    'common.members': 'membres',
  },
  en: {
    // Navigation
    'nav.meet': 'Meet',
    'nav.groups': 'Groups',
    'nav.profile': 'Profile',
    
    // Meet Screen
    'meet.title': 'Meet',
    'meet.subtitle': 'Schedule and coordinate with {{team}}',
    'meet.loading': 'Loading events...',
    'meet.headerInfo': 'Create events to check your team\'s availability and find the best time to meet',
    'meet.quickActions': 'QUICK ACTIONS',
    'meet.activeEvents.helper': 'Click on an event to view responses and manage availability',
    'meet.upcomingEvents.helper': 'Scheduled events based on team availability',
    'meet.createAction.title': 'Create Availability Event',
    'meet.createAction.description': 'Find the best time for your team to meet',
    'meet.activeEvents.title': 'Active Availability Events',
    'meet.activeEvents.empty.title': 'No active events',
    'meet.activeEvents.empty.description': 'Create an availability event to find the best time for your team',
    'meet.event.responseLabel': 'Response',
    'meet.event.responsesLabel': 'Responses',
    'meet.event.respondedStatus': '{{responses}}/{{total}} responded',
    'meet.upcomingEvents.title': 'Upcoming Events',
    'meet.upcomingEvents.empty.title': 'No upcoming events',
    'meet.upcomingEvents.empty.description': 'Calendar events will appear here',
    'meet.calendar.participants': '{{count}} participants',
    'meet.calendar.viewAvailability': 'View Availability',
    
    // Groups Screen
    'groups.title': 'Team Management',
    'groups.subtitle': 'Your gaming team and availability events',
    'groups.loading': 'Loading team data...',
    'groups.headerInfo': 'Manage your team and create events to organize your meetings',
    'groups.teamInfo': 'TEAM INFORMATION',
    'groups.quickActions': 'QUICK ACTIONS',
    'groups.eventsSection': 'TEAM EVENTS',
    'groups.team.membersTitle': 'Team Members ({{count}})',
    'groups.team.you': '(You)',
    'groups.quickAction.title': 'Create Availability Event',
    'groups.quickAction.description': 'Find the best time for your team to meet',
    'groups.activeEvents.title': 'Active Events ({{count}})',
    'groups.activeEvents.empty': 'No active events. Create one to get started!',
    'groups.event.shareLabel': 'Share',
    'groups.event.passwordProtected': 'Password protected',
    'groups.noTeam': 'No team found',
    'groups.createEvent.modalTitle': 'Create Event',
    'groups.createEvent.success': 'Event created successfully!',
    'groups.createEvent.validation.titleRequired': 'Event title is required',
    'groups.createEvent.validation.datesRequired': 'Start and end dates are required',
    'groups.createEvent.form.title': 'Event Title',
    'groups.createEvent.form.titlePlaceholder': 'e.g., Weekly Practice Session',
    'groups.createEvent.form.description': 'Description',
    'groups.createEvent.form.descriptionPlaceholder': 'Optional description',
    'groups.createEvent.form.dateRange': 'Availability Period',
    'groups.createEvent.form.dateRangeHelper': 'Select the dates when you want to check availability',
    'groups.createEvent.form.startDatePlaceholder': 'Start',
    'groups.createEvent.form.endDatePlaceholder': 'End',
    'groups.createEvent.form.timeRange': 'Daily Time Range',
    'groups.createEvent.form.timeRangeHelper': 'Set the hours to check each day',
    'groups.createEvent.form.requirePassword': 'Require password',
    'groups.createEvent.form.password': 'Password',
    'groups.createEvent.form.passwordPlaceholder': 'Enter password',
    
    // Profile Screen
    'profile.title': 'Profile',
    'profile.subtitle': 'Your gaming profile and stats',
    'profile.current_team': 'Current Team',
    'profile.activity_stats': 'Activity Stats',
    'profile.response_rate': 'Response Rate',
    'profile.events_joined': 'Events Joined',
    'profile.total_events': 'Total Events',
    'profile.settings': 'Settings',
    'profile.notifications': 'Notifications',
    'profile.timezone': 'Time Zone',
    'profile.language': 'Language',
    'profile.help': 'Help & Support',
    'profile.loading': 'Loading profile...',
    
    // Event Creation
    'event.create_title': 'Create Event',
    'event.cancel': 'Cancel',
    'event.create': 'Create',
    'event.title_label': 'Event Title *',
    'event.title_placeholder': 'e.g., Weekly Practice Session',
    'event.description_label': 'Description',
    'event.description_placeholder': 'Optional description',
    'event.start_date': 'Start Date *',
    'event.end_date': 'End Date *',
    'event.start_time': 'Start Time',
    'event.end_time': 'End Time',
    'event.require_password': 'Require password',
    'event.password': 'Password',
    'event.password_placeholder': 'Enter password',
    'event.success': 'Event created successfully!',
    'event.error_title': 'Event title is required',
    'event.error_dates': 'Start and end dates are required',
    
    // Roles
    'role.coach': 'Coach',
    'role.igl': 'IGL',
    'role.player': 'Player',
    'role.sub': 'Sub',
    'profile.role.coach': 'Coach',
    'profile.role.igl': 'IGL',
    'profile.role.player': 'Player',
    'profile.role.sub': 'Sub',
    
    // Event Types
    'event_type.tournament': 'Tournament',
    'event_type.practice': 'Practice',
    'event_type.scrim': 'Scrim',
    'event_type.game': 'Game',
    'event_type.day_off': 'Day Off',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.create': 'Create',
    'common.participants': 'participants',
    'common.responses': 'responses',
    'common.share': 'Share',
    'common.password_protected': 'Password protected',
    'common.you': '(You)',
    'common.members': 'members',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'when2meet_language';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('fr'); // Default to French
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (savedLanguage && (savedLanguage === 'fr' || savedLanguage === 'en')) {
        setLanguageState(savedLanguage as Language);
      }
    } catch (error) {
      console.error('Error loading language:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const setLanguage = async (lang: Language) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      setLanguageState(lang);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const t = (key: string, replacements?: Record<string, string | number>): string => {
    let translation = translations[language][key] || key;
    
    if (replacements) {
      Object.entries(replacements).forEach(([placeholder, value]) => {
        translation = translation.replace(`{{${placeholder}}}`, String(value));
      });
    }
    
    return translation;
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    isLoaded
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};