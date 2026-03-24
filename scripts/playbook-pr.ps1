<#!
  Creates one docs/playbooks PR for topic N (Index 1..108). Bootstrap README + scripts is a separate one-time PR.
  Usage:
    .\playbook-pr.ps1 -Index 42
    .\playbook-pr.ps1 -Index 1 -DryRun
#>
param(
  [Parameter(Mandatory = $true)]
  [ValidateRange(1, 108)]
  [int]$Index,
  [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path $PSScriptRoot -Parent
if (-not (Test-Path (Join-Path $repoRoot '.git'))) {
  throw "Could not find repo root (no .git next to scripts/). PSScriptRoot=$PSScriptRoot"
}
Set-Location $repoRoot

function ConvertTo-PlaybookSlug([string]$s) {
  $slug = $s.ToLowerInvariant()
  $slug = $slug -replace '[^a-z0-9]+', '-'
  $slug = $slug -replace '^-+|-+$', ''
  if ($slug.Length -gt 80) { $slug = $slug.Substring(0, 80).TrimEnd('-') }
  return $slug
}

function Get-PlaybookMarkdown {
  param([int]$Ordinal, [string]$Title)
  $n = $Ordinal % 12
  $why = @(
    'Product pages are where most paid traffic lands. Small copy, layout, and technical choices compound into measurable conversion and return-rate differences.',
    'Shoppers decide in seconds. Aligning merchandising, policy, and technical signals reduces friction and support tickets without adding apps.',
    'Search engines and ad platforms reward fast, clear PDPs. Structured data, honest urgency, and accessible forms protect both rankings and brand trust.',
    'Subscriptions and bundles amplify LTV but increase confusion at checkout. Upstream clarity on the PDP prevents cart abandonment and chargebacks.',
    'Cross-border and B2B buyers need explicit pricing, duties, and inventory context. The PDP is the right place to set expectations before checkout.',
    'Mobile traffic dominates for many stores. Tap targets, motion, and form behaviour must stay predictable across Safari and Chrome.',
    'Metafields and section settings scale customization. Consistent naming and validation keep theme edits safe as the catalog grows.',
    'Analytics only works when events match reality. Naming conventions and add-to-cart timing make experiments and attribution trustworthy.',
    'Performance is a feature. Images, video, and third-party scripts on the PDP directly affect LCP, INP, and ad quality scores.',
    'Accessibility is not optional. Labels, focus order, and reduced motion support every customer and reduce legal risk.',
    'Theme Check and CI catch regressions early. Treat section changes like production code: small diffs, clear schema, and reviewable Liquid.',
    'Markets, catalogs, and draft workflows multiply edge cases. Documenting assumptions in the theme keeps merchants and developers aligned.'
  )[$n]

  $steps = @(
    'Audit the current product template and note which blocks own the buy box, trust row, and subscription UI.',
    'List the shopper questions that support tickets answer today; turn those into on-page copy or metafields.',
    'Verify variant, selling plan, and bundle fields in the Theme Editor match what checkout and fulfillment expect.',
    'Run a quick pass on mobile: thumb reach, sticky elements, and modal focus traps.',
    'Ship a small change, measure add-to-cart and bounce for a week, then iterate.'
  )
  $stepLines = [System.Collections.Generic.List[string]]::new()
  for ($si = 0; $si -lt $steps.Count; $si++) {
    [void]$stepLines.Add("$($si + 1). $($steps[$si])")
  }
  $stepBlock = $stepLines -join "`n`n"

  $check = @(
    'Copy matches legal and brand guidelines for the product category.',
    'Prices and selling plans match what customers see in cart and checkout.',
    'Images and video have alt text or are marked decorative where appropriate.',
    'Forms and toggles are labeled for screen readers and keyboard users.',
    'Structured data validates without warnings for the primary variant in stock.'
  )

  $seeAlso = @(
    '- [INSTALL.md](../INSTALL.md)',
    '- [CUSTOMIZATION.md](../CUSTOMIZATION.md)',
    '- [FAQ.md](../FAQ.md)',
    '- [ARCHITECTURE.md](../ARCHITECTURE.md)'
  ) -join "`n"

  return @"
# $Title

This playbook is part of the **Product Info Advanced** documentation series. It is written for merchants and theme developers shipping high-conversion Shopify product pages.

## Why this matters

$why

## Focus for this topic

**$Title**: translate the checklist below into concrete Theme Editor choices, metafields, and section blocks so the PDP story stays consistent from ad click to order confirmation.

## Practical steps

$stepBlock

## Aligning with Product Info Advanced

Use these blocks in harmony:

- **Trust signals**: policy, compliance, and shipping facts near the decision.
- **Bundle cards**: quantity and price labels that match the cart line.
- **Subscription toggle**: default state and copy that match your selling plan groups.
- **Rating & benefits**: social proof and proof points without cluttering the buy box.
- **Media carousel**: story and demo assets that support, not distract from, the primary variant.

## Quick checklist

$( ($check | ForEach-Object { "- [ ] $_" }) -join "`n" )

## See also

$seeAlso

---
*Playbook index: [docs/playbooks/README.md](README.md)*
"@
}

# --- Playbook 1..108 ---
$topics = Get-Content (Join-Path $PSScriptRoot 'playbook-topics.txt') | Where-Object { $_.Trim() -ne '' }
if ($topics.Count -ne 108) { throw "Expected 108 topics, got $($topics.Count)" }

$title = $topics[$Index - 1]
$slug = ConvertTo-PlaybookSlug $title
$num = '{0:D3}' -f $Index
$relPath = "docs/playbooks/$num-$slug.md"
$absPath = Join-Path $repoRoot $relPath
$branch = "docs/playbook-$num-$slug"
if ($branch.Length -gt 80) { $branch = "docs/playbook-$num" }

$body = Get-PlaybookMarkdown -Ordinal $Index -Title $title

if ($DryRun) {
  Write-Host $body
  exit 0
}

$ea = $ErrorActionPreference
$ErrorActionPreference = 'SilentlyContinue'
git checkout master 2>$null
$ErrorActionPreference = $ea
git pull origin master
if ($LASTEXITCODE -ne 0) { throw "git pull failed" }
$ErrorActionPreference = 'SilentlyContinue'
git branch -D $branch 2>$null
$ErrorActionPreference = $ea
git checkout -b $branch
if ($LASTEXITCODE -ne 0) { throw "git checkout -b failed" }

New-Item -ItemType Directory -Force -Path (Split-Path $absPath -Parent) | Out-Null
Set-Content -Path $absPath -Value $body -Encoding utf8

$commitMsg = "docs(playbooks): add playbook $num - $title"
git add $relPath
git commit -m $commitMsg
git push -u origin $branch --force

$prTitle = "docs(playbooks): $num $title"
$safeTitle = $title -replace '"', '\"'
$prUrl = gh pr create --repo rsusano/shopify-product-info-advanced --head $branch --base master `
  --title $prTitle `
  --body @"
## Summary
Adds ``$relPath``: a focused playbook for **$safeTitle** on Shopify product pages using Product Info Advanced.

## Why
Merchant-facing, single-topic documentation that stays reviewable and useful if someone browses the repo.

## Test plan
- [ ] Markdown renders
- [ ] Links to sibling docs work
"@
if ($prUrl -notmatch '/pull/(\d+)') {
  throw "gh pr create did not return a PR URL (got: $prUrl)"
}
$prNum = $Matches[1]
gh pr merge $prNum --repo rsusano/shopify-product-info-advanced --merge --delete-branch
git checkout master
git pull origin master
Write-Host "Done: $prTitle"
