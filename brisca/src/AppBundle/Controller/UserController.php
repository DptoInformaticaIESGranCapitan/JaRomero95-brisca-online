<?php
namespace AppBundle\Controller;

use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use AppBundle\Form\UserType;
use AppBundle\Form\PasswordUserType;
use AppBundle\Entity\User;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;

class UserController extends Controller
{
    /**
     * @Route("/registro", name="register")
     */
    public function registerAction(Request $request)
    {
        // FIXME denegar acceso al registro a usuarios logueados
        // 1) build the form
        $user = new User();
        $form = $this->createForm(UserType::class, $user);

        // 2) handle the submit (will only happen on POST)
        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {

            // 3) Encode the password (you could also do this via Doctrine listener)
            $password = $this->get('security.password_encoder')
                ->encodePassword($user, $user->getPlainPassword());
            $user->setPassword($password);

            // 4) save the User!
            $em = $this->getDoctrine()->getManager();
            $user->uploadImg();
            $em->persist($user);
            $em->flush();

//            TODO flash éxito!
            // ... do any other work - like sending them an email, etc
            // maybe set a "flash" success message for the user

            return $this->redirectToRoute('homepage');
        }

        return $this->render('user/registro.html.twig',
            array('form' => $form->createView())
        );
    }

    /**
     * @Route("/perfil", name="perfil")
     */
    public function perfilAction(Request $request)
    {
        // 1) build the form
        $user = $this->getUser();
        $form = $this->createForm(UserType::class, $user);

        // 2) handle the submit (will only happen on POST)
        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {

            if (null != $user->getPlainPassword()) {
                $password = $this->get('security.password_encoder')
                    ->encodePassword($user, $user->getPlainPassword());
                $user->setPassword($password);
            }

            $rootDir = $this->container->getParameter('kernel.root_dir').'/../web/uploads/images';
            $user->uploadImg($rootDir);


            $em = $this->getDoctrine()->getManager();
//            $user->uploadImg();

            $em->persist($user);
            $em->flush();
//            TODO flash éxito!
            // ... do any other work - like sending them an email, etc
            // maybe set a "flash" success message for the user
        }


        return $this->render('user/perfil.html.twig',
            array(
                'form' => $form->createView()
            )
        );
    }

    /**
     * @Route("/login", name="login")
     */
    public function loginAction(Request $request)
    {
        $authenticationUtils = $this->get('security.authentication_utils');

        // get the login error if there is one
        $error = $authenticationUtils->getLastAuthenticationError();

        // last username entered by the user
        $lastUsername = $authenticationUtils->getLastUsername();

        return $this->render('user/login.html.twig',
            array(
                // last username entered by the user
                'last_username' => $lastUsername,
                'error' => $error,
            )
        );
    }
}