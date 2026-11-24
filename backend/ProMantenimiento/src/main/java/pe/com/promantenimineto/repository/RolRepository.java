package pe.com.promantenimineto.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import pe.com.promantenimineto.entity.RolEntity;

public interface RolRepository extends JpaRepository<RolEntity, Long>{
	@Query("select d from RolEntity d where d.activo=true")
	List<RolEntity> findAllCustom();

	Optional<RolEntity> findByCodigoAndActivoTrue(String codigo);
}
