export const translations = {
  en: {
    tabs: {
      calendar: 'Calendar',
      group: 'My Group',
      profile: 'Profile'
    },
    calendar: {
      title: 'My Availability',
      selectDate: 'Select dates when you are available',
      hours: 'Hours',
      save: 'Save Availability',
      saved: 'Availability saved!',
      noGroup: 'Join a group first'
    },
    group: {
      title: 'Group Availability',
      noGroup: 'No Group',
      joinGroup: 'Join a Group',
      createGroup: 'Create Group',
      groupCode: 'Group Code',
      members: 'Members',
      heatMap: 'Availability Heat Map',
      available: 'available',
      enterCode: 'Enter group code',
      groupName: 'Group name'
    },
    profile: {
      title: 'Profile',
      name: 'Name',
      email: 'Email',
      language: 'Language',
      english: 'English',
      french: 'French',
      currentGroup: 'Current Group',
      leaveGroup: 'Leave Group',
      logout: 'Logout'
    },
    common: {
      save: 'Save',
      cancel: 'Cancel',
      confirm: 'Confirm',
      error: 'Error',
      success: 'Success'
    }
  },
  fr: {
    tabs: {
      calendar: 'Calendrier',
      group: 'Mon Groupe',
      profile: 'Profil'
    },
    calendar: {
      title: 'Ma Disponibilité',
      selectDate: 'Sélectionnez les dates où vous êtes disponible',
      hours: 'Heures',
      save: 'Enregistrer la disponibilité',
      saved: 'Disponibilité enregistrée!',
      noGroup: 'Rejoignez d\'abord un groupe'
    },
    group: {
      title: 'Disponibilité du Groupe',
      noGroup: 'Aucun Groupe',
      joinGroup: 'Rejoindre un Groupe',
      createGroup: 'Créer un Groupe',
      groupCode: 'Code du Groupe',
      members: 'Membres',
      heatMap: 'Carte de Disponibilité',
      available: 'disponible',
      enterCode: 'Entrer le code du groupe',
      groupName: 'Nom du groupe'
    },
    profile: {
      title: 'Profil',
      name: 'Nom',
      email: 'Email',
      language: 'Langue',
      english: 'Anglais',
      french: 'Français',
      currentGroup: 'Groupe Actuel',
      leaveGroup: 'Quitter le Groupe',
      logout: 'Déconnexion'
    },
    common: {
      save: 'Enregistrer',
      cancel: 'Annuler',
      confirm: 'Confirmer',
      error: 'Erreur',
      success: 'Succès'
    }
  }
};

export type Language = 'en' | 'fr';
export type TranslationKey = typeof translations.en;