package pe.com.promantenimineto.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import pe.com.promantenimineto.entity.TareaPreventivaEntity;

public interface TareaPreventivaRepository extends JpaRepository<TareaPreventivaEntity, Long> {

    @Query("select d from TareaPreventivaEntity d")
    List<TareaPreventivaEntity> findAllCustom();

}