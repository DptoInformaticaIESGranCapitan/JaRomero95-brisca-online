<?php
namespace WreckThemBundle\Controller;

use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use WreckThemBundle\Form\UserType;
use WreckThemBundle\Form\PasswordUserType;
use WreckThemBundle\Entity\User;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;

class UserController extends Controller
{
    public function registerAction(Request $request)
    {
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
            $em->persist($user);
            $em->flush();

//            TODO flash éxito!
            // ... do any other work - like sending them an email, etc
            // maybe set a "flash" success message for the user

            return $this->redirectToRoute('homepage');
        }

        return $this->render('WreckThemBundle:User:registro.html.twig',
            array('form' => $form->createView())
        );
    }

    public function perfilAction(Request $request)
    {
        // 1) build the form
        $user = $this->getUser();
        $form = $this->createForm(UserType::class, $user)
            ->remove('plainPassword');

        $formPasswd = $this->createForm(PasswordUserType::class, $user);

        // 2) handle the submit (will only happen on POST)
        $form->handleRequest($request);
        $formPasswd->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            $em = $this->getDoctrine()->getManager();
            $em->persist($user);
            $em->flush();
//            TODO flash éxito!
            // ... do any other work - like sending them an email, etc
            // maybe set a "flash" success message for the user
        }elseif ($formPasswd->isSubmitted() && $formPasswd->isValid()) {
            $passwordOriginal = $formPasswd->getData()->getPassword();
            if (null == $user->getPassword()) {
                $user->setPassword($passwordOriginal);
            } else {
                // 3) Encode the password (you could also do this via Doctrine listener)
                $password = $this->get('security.password_encoder')
                    ->encodePassword($user, $user->getPlainPassword());
                $user->setPassword($password);
            }

            $em = $this->getDoctrine()->getManager();
            $em->persist($user);
            $em->flush();
//            TODO flash éxito!
            // ... do any other work - like sending them an email, etc
            // maybe set a "flash" success message for the user
        }

        return $this->render('WreckThemBundle:User:perfil.html.twig',
            array(
                'form' => $form->createView(),
                'formPasswd' => $formPasswd->createView()
            )
        );
    }

    public function loginAction(Request $request)
    {
        $authenticationUtils = $this->get('security.authentication_utils');

        // get the login error if there is one
        $error = $authenticationUtils->getLastAuthenticationError();

        // last username entered by the user
        $lastUsername = $authenticationUtils->getLastUsername();

        return $this->render(
            'WreckThemBundle:User:login.html.twig',
            array(
                // last username entered by the user
                'last_username' => $lastUsername,
                'error' => $error,
            )
        );
    }
}