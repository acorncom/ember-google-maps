# Release Process

Releases in this repo are mostly automated using [release-plan](https://github.com/release-plan/release-plan/). Once you label all your PRs correctly (see below) you will have an automatically generated PR that updates each package's `CHANGELOG.md` and a `.release-plan.json` that is used to prepare the release once the PR is merged.

`ember-google-maps` and `ember-google-maps-directions` version independently — a PR that only touches `ember-google-maps-directions` releases a new version of that package alone.

## Preparation

Since the majority of the actual release process is automated, the remaining tasks before releasing are:

- correctly labeling **all** pull requests that have been merged since the last release
- updating pull request titles so they make sense to our users

Some great information on why this is important can be found at [keepachangelog.com](https://keepachangelog.com/en/1.1.0/), but the overall
guiding principle here is that changelogs are for humans, not machines.

When reviewing merged PRs the labels to use are:

- breaking - the PR is a breaking change (major version bump)
- enhancement - the PR adds a new feature or enhancement (minor version bump)
- bug - the PR fixes a bug included in a previous release (patch version bump)
- documentation - the PR adds or updates documentation (no release)
- internal - internal changes or things that don't fit in any other category (no release)

**Note:** `release-plan` requires that **all** merged PRs are labeled before it will prepare a release. If a PR doesn't fit in a category, label it `internal`.

## Release

Once the prep work is done, the actual release is straightforward: merge the open "Prepare Release" PR. The `Publish Stable` workflow picks up from there — it tags the release, publishes to npm, and creates a GitHub release.
