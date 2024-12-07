-- Nejprve odstraníme existující triggery
drop trigger if exists update_project_status_timestamp on project_statuses;
drop trigger if exists update_project_status_step_timestamp on project_status_steps;
drop function if exists update_timestamp cascade;

-- Přidání sloupců pro adresu a GPS souřadnice do tabulky projects
alter table projects 
add column if not exists address text,
add column if not exists gps_coordinates text,
add column if not exists microwave_band text;

-- Přidání validace pro microwave_band
alter table projects drop constraint if exists projects_microwave_band_check;
alter table projects add constraint projects_microwave_band_check 
  check (microwave_band is null or microwave_band in (
    '2.4 GHz (bezlicenční)',
    '5 GHz (bezlicenční)',
    '10.5 GHz (bezlicenční)',
    '17 GHz (bezlicenční)',
    '24 GHz (bezlicenční)',
    '57-66 GHz (bezlicenční)',
    '11 GHz (licencované)',
    '13 GHz (licencované)',
    '18 GHz (licencované)',
    '23 GHz (licencované)',
    '26 GHz (licencované)',
    '32 GHz (licencované)',
    '38 GHz (licencované)',
    '42 GHz (licencované)',
    '71-76 / 81-86 GHz (E-Band)'
  ));

-- Vyčistíme existující data
delete from project_completed_steps;
delete from projects;
delete from project_status_steps;
delete from project_statuses;

-- Vytvoření tabulky pro stavy projektů
create table if not exists project_statuses (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  name text not null,
  description text,
  icon text not null,
  color text not null,
  show_on_dashboard boolean default true,
  type text check (type in ('initial', 'regular', 'final')) not null,
  position integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Vytvoření tabulky pro kroky stavů
create table if not exists project_status_steps (
  id uuid primary key default uuid_generate_v4(),
  status_id uuid references project_statuses(id) on delete cascade,
  name text not null,
  description text,
  position integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  description text
);

-- Vytvoření tabulky pro dokončené kroky projektů
create table if not exists project_completed_steps (
  project_id uuid references projects(id) on delete cascade,
  step_id uuid references project_status_steps(id) on delete cascade,
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (project_id, step_id)
);

-- Trigger pro automatickou aktualizaci časového razítka
create or replace function update_timestamp()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Vytvoření triggerů
create trigger update_project_status_timestamp
  before update on project_statuses
  for each row
  execute function update_timestamp();

create trigger update_project_status_step_timestamp
  before update on project_status_steps
  for each row
  execute function update_timestamp();

-- Vložení výchozích stavů
insert into project_statuses (code, name, description, icon, color, type, position, show_on_dashboard) values
  ('new', 'Nový', 'Nově vytvořený projekt', 'FileText', '#4B5563', 'initial', 1, false),
  ('preparation', 'Příprava', 'Příprava technického řešení', 'ClipboardList', '#3B82F6', 'regular', 2, true),
  ('approval', 'Schvalování', 'Čeká na schválení', 'Clock', '#EAB308', 'regular', 3, true),
  ('implementation', 'Realizace', 'Probíhá realizace', 'Radio', '#9333EA', 'regular', 4, true),
  ('documentation', 'Dokumentace', 'Příprava dokumentace', 'FileText', '#F97316', 'regular', 5, true),
  ('completed', 'Dokončeno', 'Projekt je dokončen', 'CheckCircle2', '#22C55E', 'final', 6, true);

-- Vložení výchozích kroků pro stavy (kromě počátečního a koncového)
insert into project_status_steps (status_id, name, description, position)
select 
  id,
  'Technický návrh',
  'Příprava technického řešení a kalkulace',
  1
from project_statuses where code = 'preparation';

insert into project_status_steps (status_id, name, description, position)
select 
  id,
  'Kalkulace nákladů',
  'Výpočet nákladů na realizaci',
  2
from project_statuses where code = 'preparation';

insert into project_status_steps (status_id, name, description, position)
select 
  id,
  'Příprava dokumentace',
  'Příprava technické dokumentace',
  3
from project_statuses where code = 'preparation';

insert into project_status_steps (status_id, name, description, position)
select 
  id,
  'Technický souhlas',
  'Získání souhlasu od Vantage Towers',
  1
from project_statuses where code = 'approval';

insert into project_status_steps (status_id, name, description, position)
select 
  id,
  'Kontrola dokumentace',
  'Kontrola a revize dokumentace',
  2
from project_statuses where code = 'approval';

insert into project_status_steps (status_id, name, description, position)
select 
  id,
  'Instalace zařízení',
  'Montáž a konfigurace spojů',
  1
from project_statuses where code = 'implementation';

insert into project_status_steps (status_id, name, description, position)
select 
  id,
  'Konfigurace zařízení',
  'Nastavení a konfigurace spojů',
  2
from project_statuses where code = 'implementation';

insert into project_status_steps (status_id, name, description, position)
select 
  id,
  'Testování',
  'Testování funkčnosti spojení',
  3
from project_statuses where code = 'implementation';

insert into project_status_steps (status_id, name, description, position)
select 
  id,
  'Výstupní dokumentace',
  'Příprava a předání dokumentace',
  1
from project_statuses where code = 'documentation';