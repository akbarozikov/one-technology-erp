# Phase 1 Scope — Access and Company Structure

## Goal
Build the first real ERP module set:
- roles
- permissions
- users
- employees
- branches
- locations
- warehouses
- warehouse positions

## Included
- database schema for these entities
- backend API skeleton for managing them
- basic frontend admin pages
- role-aware access shell
- minimal audit logging foundation

## Not Included
- stock balances
- CRM
- quotes
- orders
- constructor
- payments
- document generation

## Business Notes
- installers are employees, not ERP users in V1
- owner sees all sensitive data
- sales managers will later have record-level restrictions
- Samarkand exists as simplified secondary/partner operational point