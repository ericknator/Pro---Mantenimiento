package pe.com.promantenimineto.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import pe.com.promantenimineto.entity.AuditoriaSistemaEntity;

public interface AuditoriaSistemaRepository extends JpaRepository<AuditoriaSistemaEntity, Long> {

    @Query("select d from AuditoriaSistemaEntity d")
    List<AuditoriaSistemaEntity> findAllCustom();

}