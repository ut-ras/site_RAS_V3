import { StaticImageData } from 'next/image';
import RasLogoBigPic from '../../../public/images/ras_logo_big.png';

import AshlynnPic from '../../../public/images/leaders/Ashlynn.png';
import BarretPic from '../../../public/images/leaders/Barret-Lubianski.jpeg';
import GustavoVillalobosPic from '../../../public/images/leaders/GustavoVillalobos.jpg';
import JeffreyChangPic from '../../../public/images/leaders/Jeffrey-Chang.jpg';
import KarmanyaahMalhotraPic from '../../../public/images/leaders/Karmanyaah-Malhotra.jpg';
import LinhPic from '../../../public/images/leaders/Linh.jpg';
import NataliePic from '../../../public/images/leaders/Natalie-Best.png';
import TobyNguyenPic from '../../../public/images/leaders/Toby-Nguyen.jpg';
import YilinJinPic from '../../../public/images/leaders/Yilin-Jin.jpg';
import ZaaraBilalPic from '../../../public/images/leaders/Zaara-Bilal.jpg';

interface officers {
    name: string;
    title: string;
    email: string;
    profileLink: string;
    discord?: string;
    picture: StaticImageData;
}

interface leaders {
    name: string;
    profileLink: string;
    picture: StaticImageData;
}

export const officers: officers[] = [
    {
      name: 'Allen Ai', title: 'President', email: 'haicil@utexas.edu',
      profileLink: '', picture: RasLogoBigPic },
    {
      name: 'Barrett Lubianski', title: 'Vice-President', email: 'barrettlubianski@utexas.edu',
      profileLink: '', picture: BarretPic },
    {
      name: 'Esther Chen', title: 'Treasurer', email: 'estherchen@utexas.edu',
      profileLink: '', picture: RasLogoBigPic },
    {
      name: 'Reuben DeFrates', title: 'Corporate Relations', email: 'edefrates@utexas.edu',
      profileLink: '', picture: RasLogoBigPic },
    {
      name: 'Tianna Resendez', title: 'Outreach Coordinator', email: 'Tir276@my.utexas.edu',
      profileLink: '', picture: RasLogoBigPic },
    {
      name: 'Yiran Yin', title: 'Secretary', email: 'yy23268@eid.utexas.edu',
      profileLink: '', picture: RasLogoBigPic },
    {
      name: 'Brianna Martinez', title: 'Publicity Coordinator', email: 'bm43647@eid.utexas.edu',
      profileLink: '', picture: RasLogoBigPic },
    {
      name: 'Neureka Kundu', title: 'Special Events Coordinator', email: 'nk25359@my.utexas.edu',
      profileLink: '', picture: RasLogoBigPic },
    {
      name: 'Daniel Chen', title: 'Webmaster', email: 'dc48985@eid.utexas.edu',
      profileLink: '', picture: RasLogoBigPic },
];

export const teamleads: officers[] = [
    {
      name: 'Karmanyaah Malhotra', title: 'VEXU Head', email: 'karmalhotra@utexas.edu',
      profileLink: '', discord: '', picture: KarmanyaahMalhotraPic },
    {
      name: 'Natalie Best', title: 'VEXU Head', email: 'nbest776@utexas.edu',
      profileLink: '', discord: '', picture: NataliePic },
    {
        name: 'Gustavo Villalobos', title: 'RoboMaster Head', email: 'gvp05@utexas.edu',
      profileLink: '', discord: '', picture: GustavoVillalobosPic },
    {
      name: 'Suhas Voolla', title: 'RoboMaster Head', email: 'suhasv@utexas.edu',
      profileLink: '', discord: '', picture: RasLogoBigPic },
    {
        name: 'George Adamopoulos', title: 'Steering Head', email: 'ga23569@eid.utexas.edu',
      profileLink: '', discord: '', picture: RasLogoBigPic },
    {
      name: 'Aishwarya Immanuelraj', title: 'Steering Head', email: 'ai7644@eid.utexas.edu',
      profileLink: '', discord: '', picture: RasLogoBigPic },
    {
      name: 'Dhruv Bansal', title: 'Demobots Head', email: 'dhruvbansal@utexas.edu',
      profileLink: '', discord: '', picture: RasLogoBigPic },
];

export const leaders: leaders[] = [
    { name: "Jeffrey Chang", profileLink: '', picture: JeffreyChangPic },
    { name: "Arnav Jain", profileLink: '', picture: RasLogoBigPic },
    { name: "Matthew Zhang", profileLink: '', picture: RasLogoBigPic },
    { name: "Yilin Jin", profileLink: '', picture: YilinJinPic },
    { name: "Richard Aguilar", profileLink: '', picture: RasLogoBigPic },
    { name: "Ashlynn Tusneem", profileLink: '', picture: AshlynnPic },
    { name: "Junhan (Johnny) Shen", profileLink: '', picture: RasLogoBigPic },
    { name: "Sicheng (Terry) Tan", profileLink: '', picture: RasLogoBigPic },
    { name: "Theodore Hubbard", profileLink: '', picture: RasLogoBigPic },
    { name: "Annie Vu", profileLink: '', picture: RasLogoBigPic },
    { name: "Colin Tan", profileLink: '', picture: RasLogoBigPic },
    { name: "Linh Tran", profileLink: '', picture: LinhPic },
    { name: "Morris Lin", profileLink: '', picture: RasLogoBigPic },
    { name: "Deryk Vences", profileLink: '', picture: RasLogoBigPic },
    { name: "Toby Nguyen", profileLink: '', picture: TobyNguyenPic },
    { name: "Zaara Bilal", profileLink: '', picture: ZaaraBilalPic },
    { name: "Samuel Deng", profileLink: '', picture: RasLogoBigPic },
    { name: "Andrew Kwa", profileLink: '', picture: RasLogoBigPic },
    { name: "Emilio Lopez", profileLink: '', picture: RasLogoBigPic },
    { name: "Jericho Perez", profileLink: '', picture: RasLogoBigPic },
    { name: "Hailin Chen", profileLink: '', picture: RasLogoBigPic },
    { name: "Guillermo Barrera", profileLink: '', picture: RasLogoBigPic },
    { name: "Joseph Weiss", profileLink: '', picture: RasLogoBigPic },
    { name: "Iha Sehgal", profileLink: '', picture: RasLogoBigPic },
];
