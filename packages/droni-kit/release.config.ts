// release.config.ts
// Nota: En el monorepo, los commits deben usar el scope "droni-kit"
// para que semantic-release los detecte como relevantes para este paquete.
// Ej: feat(droni-kit): add new Button variant
export default {
  branches: ['main', { name: 'beta', prerelease: true }],
  // Prefijamos los tags con "droni-kit/" para no colisionar con otros releases del monorepo
  tagFormat: 'droni-kit/v${version}',
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      {
        // Solo considera commits con scope "droni-kit" para esta release
        releaseRules: [
          { scope: 'droni-kit', type: 'feat', release: 'minor' },
          { scope: 'droni-kit', type: 'fix', release: 'patch' },
          { scope: 'droni-kit', type: 'perf', release: 'patch' },
          { scope: 'droni-kit', type: 'refactor', release: 'patch' },
          { scope: 'droni-kit', breaking: true, release: 'major' },
          // Ignora commits de otros scopes
          { scope: '!droni-kit', release: false },
        ],
        parserOpts: {
          noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES'],
        },
      },
    ],
    "@semantic-release/release-notes-generator",
    [
      "@semantic-release/changelog",
      {
        changelogFile: "CHANGELOG.md",
      },
    ],
    "@semantic-release/npm",
    [
      "@semantic-release/git",
      {
        assets: ["package.json", "CHANGELOG.md"],
        message: "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}",
      },
    ],
    "@semantic-release/github",
  ],
};