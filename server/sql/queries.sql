select total_usuarios,
       total_assinantes,
       round(
          (total_assinantes * 100.0 / total_usuarios),
          2
       ) as taxa_conversao_percentual
  from (
   select (
      select count(*)
        from users_pathfindr
   ) as total_usuarios,
          (
             select count(distinct user_id)
               from subscriptions_pathfindr
              where active = 1
          ) as total_assinantes
     from dual
);

select count(*) as total_assinantes_ativos
  from subscriptions_pathfindr
 where active = 1;