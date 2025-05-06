ALTER TABLE t_users 
ALTER COLUMN mot_passe_user TYPE VARCHAR(100);

ALTER TABLE "T_Factures"
  ALTER COLUMN "Date_Fact" TYPE date,
  ALTER COLUMN "Heure_Fact" TYPE time;
