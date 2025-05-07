ALTER TABLE t_users 
ALTER COLUMN mot_passe_user TYPE VARCHAR(100);

ALTER TABLE "T_Factures"
  ALTER COLUMN "Date_Fact" TYPE date,
  ALTER COLUMN "Heure_Fact" TYPE time;

  ALTER TABLE public."T_Tranches"
    ALTER COLUMN "Heure_Tran" TYPE time without time zone ;

  ALTER TABLE public."T_Tranches"
    ALTER COLUMN "Date_Tran" TYPE date;
