# Padding Best Practices - React Native When2Meet

## ✅ Spacing System

Utilisez toujours les valeurs du thème CS2 :
```typescript
import { Spacing } from '../theme';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.xl,  // 32px
    paddingVertical: Spacing.lg,    // 24px
  }
});
```

### Valeurs disponibles :
- `Spacing.xs` = 4px
- `Spacing.sm` = 8px  
- `Spacing.md` = 16px
- `Spacing.lg` = 24px
- `Spacing.xl` = 32px
- `Spacing.xxl` = 48px

## 🎯 Layout Props Pattern

### ✅ Utilisez les props spécifiques :
```typescript
// CORRECT - Spécifique et précis
paddingHorizontal: Spacing.lg,
paddingVertical: Spacing.md,
paddingTop: Spacing.xl,
paddingBottom: Spacing.sm,
paddingLeft: Spacing.md,
paddingRight: Spacing.md,
```

### ❌ Évitez le padding générique :
```typescript
// INCORRECT - Moins précis
padding: Spacing.lg, // Affecte tous les côtés
```

## 📱 Recommendations par Composant

### Headers
```typescript
headerContainer: {
  paddingHorizontal: Spacing.lg,
  paddingVertical: Spacing.md,
  paddingTop: Spacing.xl, // Pour la status bar
}
```

### Formulaires
```typescript
formContainer: {
  paddingHorizontal: Spacing.xl,
  paddingVertical: Spacing.lg,
}

inputWrapper: {
  paddingHorizontal: Spacing.lg,
  paddingVertical: Spacing.md,
}
```

### Listes et Cards
```typescript
card: {
  paddingHorizontal: Spacing.lg,
  paddingVertical: Spacing.md,
  marginBottom: Spacing.md,
}

listContainer: {
  paddingHorizontal: Spacing.md,
}
```

### Boutons
```typescript
button: {
  paddingVertical: Spacing.lg,
  paddingHorizontal: Spacing.xl,
}

smallButton: {
  paddingVertical: Spacing.md,
  paddingHorizontal: Spacing.lg,
}
```

### Modals fullscreen
```typescript
modalContainer: {
  paddingHorizontal: Spacing.xl,
  paddingTop: Spacing.lg,
  paddingBottom: Spacing.xxl, // Extra space pour les boutons
}

bottomButtons: {
  paddingHorizontal: Spacing.xl,
  paddingVertical: Spacing.lg,
  paddingBottom: Spacing.xxl, // Safe area
}
```

## 🔧 Debugging Tips

### Visualiser le padding
```typescript
// Ajoutez temporairement pour debug
backgroundColor: 'rgba(255, 0, 0, 0.2)', // Rouge transparent
```

### Vérifier les SafeArea
```typescript
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const insets = useSafeAreaInsets();
paddingTop: insets.top + Spacing.lg,
paddingBottom: insets.bottom + Spacing.lg,
```

## 📐 Responsive Considerations

```typescript
// Pour les écrans plus petits
const isSmallScreen = width < 380;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: isSmallScreen ? Spacing.md : Spacing.xl,
  }
});
```

## ⚡ Quick Reference

| Usage | Horizontal | Vertical |
|-------|------------|----------|
| Page container | `xl` (32px) | `lg` (24px) |
| Form sections | `xl` (32px) | `md` (16px) |
| Card content | `lg` (24px) | `md` (16px) |
| Button content | `xl` (32px) | `lg` (24px) |
| List items | `md` (16px) | `md` (16px) |
| Modal content | `xl` (32px) | `lg` (24px) |

---

**Note**: Respectez toujours les guidelines du thème CS2 pour maintenir la cohérence visuelle !