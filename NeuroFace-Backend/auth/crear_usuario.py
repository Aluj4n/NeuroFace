from getpass import getpass

from auth.usuarios_db import (
    inicializar_bd,
    crear_usuario
)


def main():

    inicializar_bd()

    print()
    print("====================================")
    print("      NEUROFACE - NUEVO USUARIO")
    print("====================================")
    print()

    # ==============================================
    # DATOS DEL USUARIO
    # ==============================================

    usuario = input(
        "Usuario: "
    ).strip()

    nombre = input(
        "Nombre completo: "
    ).strip()

    rol = input(
        "Rol (usuario/admin): "
    ).strip().lower()

    password = getpass(
        "Contraseña: "
    )

    confirmacion = getpass(
        "Repetir contraseña: "
    )


    # ==============================================
    # VALIDACIONES
    # ==============================================

    if not usuario:

        print()
        print("El usuario es obligatorio.")
        return


    if not nombre:

        print()
        print("El nombre es obligatorio.")
        return


    if rol not in [
        "usuario",
        "admin"
    ]:

        print()
        print(
            "El rol debe ser 'usuario' o 'admin'."
        )

        return


    if not password:

        print()
        print(
            "La contraseña es obligatoria."
        )

        return


    if len(password) < 8:

        print()
        print(
            "La contraseña debe tener mínimo 8 caracteres."
        )

        return


    if password != confirmacion:

        print()
        print(
            "Las contraseñas no coinciden."
        )

        return


    # ==============================================
    # CREAR USUARIO EN SQLITE
    # ==============================================

    resultado = crear_usuario(
        usuario=usuario,
        nombre=nombre,
        password=password,
        rol=rol
    )


    # ==============================================
    # RESULTADO
    # ==============================================

    print()
    print(
        resultado["mensaje"]
    )


    if resultado.get("ok"):

        print()
        print("------------------------------------")
        print("DATOS DE LA CUENTA")
        print("------------------------------------")

        print(
            f"Usuario : {resultado['usuario']}"
        )

        print(
            f"Correo  : {resultado['correo']}"
        )

        print(
            f"Rol     : {resultado['rol']}"
        )

        print("------------------------------------")


    print()


if __name__ == "__main__":
    main()