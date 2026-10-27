package pe.com.promantenimineto.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import pe.com.promantenimineto.entity.TareaPreventivaEntity;

public interface TareaPreventivaRepository extends JpaRepository<TareaPreventivaEntity, Long> {
    
    @Query("SELECT t FROM TareaPreventivaEntity t")
    List<TareaPreventivaEntity> findAllCustom();

    @Query("""
        SELECT t
        FROM TareaPreventivaEntity t
        WHERE t.responsable.id = :responsableId
        ORDER BY t.programadaPara ASC
        """)
    List<TareaPreventivaEntity> findByResponsableId(
            @Param("responsableId") Long responsableId
    );

}