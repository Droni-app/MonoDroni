/** @type {import('@commitlint/types').UserConfig} */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Scopes válidos para el monorepo
    'scope-enum': [
      2,
      'always',
      [
        'appi',      // Backend Laravel
        'site',      // Front Droni.co
        'drodmin',   // Front Backoffice
        'droni-kit', // UI Library
        'deps',      // Actualizaciones de dependencias
        'ci',        // GitHub Actions / CI
        'infra',     // Infraestructura general
        'release',   // Release commits (semantic-release)
      ],
    ],
    // El scope es obligatorio
    'scope-empty': [2, 'never'],
    // Tipo en minúsculas
    'type-case': [2, 'always', 'lower-case'],
    // Tipos permitidos
    'type-enum': [
      2,
      'always',
      [
        'feat',     // Nueva funcionalidad
        'fix',      // Corrección de bug
        'docs',     // Documentación
        'style',    // Cambios de estilo/formato (no afectan lógica)
        'refactor', // Refactoring
        'perf',     // Mejoras de rendimiento
        'test',     // Tests
        'build',    // Build system o dependencias externas
        'ci',       // CI configuration
        'chore',    // Tareas de mantenimiento
        'revert',   // Revertir commit
      ],
    ],
  },
};
