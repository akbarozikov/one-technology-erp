-- Phase 10AB: document system foundation.
-- General-purpose document templates and generated-document records,
-- with the first practical use case being commercial proposals from quote / quote_version context.

PRAGMA foreign_keys = ON;

CREATE TABLE document_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  template_type TEXT NOT NULL CHECK (
    template_type IN ('quote', 'order', 'payment', 'installation', 'service', 'internal')
  ),
  entity_type TEXT NOT NULL CHECK (
    entity_type IN (
      'quote',
      'quote_version',
      'order',
      'payment',
      'installation_job',
      'installation_result',
      'stock_transfer_document'
    )
  ),
  description TEXT,
  template_content TEXT,
  output_format TEXT NOT NULL CHECK (
    output_format IN ('html', 'pdf', 'docx')
  ),
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_by_user_id INTEGER REFERENCES users (id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE generated_documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  template_id INTEGER NOT NULL REFERENCES document_templates (id) ON DELETE RESTRICT,
  document_number TEXT,
  title TEXT NOT NULL,
  entity_type TEXT NOT NULL CHECK (
    entity_type IN (
      'quote',
      'quote_version',
      'order',
      'payment',
      'installation_job',
      'installation_result',
      'stock_transfer_document'
    )
  ),
  entity_id INTEGER NOT NULL CHECK (entity_id > 0),
  generation_status TEXT NOT NULL DEFAULT 'draft' CHECK (
    generation_status IN ('draft', 'generated', 'failed', 'archived')
  ),
  rendered_content TEXT,
  file_url TEXT,
  file_name TEXT,
  mime_type TEXT,
  generated_by_user_id INTEGER REFERENCES users (id) ON DELETE SET NULL,
  generated_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE document_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  generated_document_id INTEGER NOT NULL REFERENCES generated_documents (id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (
    entity_type IN (
      'quote',
      'quote_version',
      'order',
      'payment',
      'installation_job',
      'installation_result',
      'stock_transfer_document'
    )
  ),
  entity_id INTEGER NOT NULL CHECK (entity_id > 0),
  link_role TEXT NOT NULL CHECK (
    link_role IN ('primary', 'supporting', 'derived_from', 'related')
  ),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_document_templates_type ON document_templates (template_type);
CREATE INDEX idx_document_templates_entity_type ON document_templates (entity_type);
CREATE INDEX idx_document_templates_created_by ON document_templates (created_by_user_id);

CREATE INDEX idx_generated_documents_template ON generated_documents (template_id);
CREATE INDEX idx_generated_documents_entity ON generated_documents (entity_type, entity_id);
CREATE INDEX idx_generated_documents_number ON generated_documents (document_number);
CREATE INDEX idx_generated_documents_status ON generated_documents (generation_status);
CREATE INDEX idx_generated_documents_generated_by ON generated_documents (generated_by_user_id);
CREATE INDEX idx_generated_documents_generated_at ON generated_documents (generated_at);

CREATE INDEX idx_document_links_generated_document ON document_links (generated_document_id);
CREATE INDEX idx_document_links_entity ON document_links (entity_type, entity_id);
CREATE INDEX idx_document_links_role ON document_links (link_role);
